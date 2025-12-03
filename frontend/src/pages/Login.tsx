import React, { useState, useEffect } from 'react';
import { UserIcon, LockIcon, ArrowLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Variants } from 'framer-motion';


interface LoginProps {
  onLogin: (
    role: 'Admin' | 'Technicien' | 'Employé',
    token: string,
    user: {
      _id: string;
      name: string;
      email: string;
      role: 'Admin' | 'Technicien' | 'Employé';
    }
  ) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: [0.25, 0.46, 0.45, 0.94] // équivalent à easeOut
    } 
  },
};

const particlesCount = 30;

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validation basique
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      console.log('[LOGIN] Tentative de connexion pour:', email);

      const response = await fetch( process.env.BACKEND_URL + '/api/users/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const responseData = await response.json();
      console.log('[LOGIN] Réponse complète:', responseData);

      if (!response.ok) {
        // Gestion spécifique des erreurs HTTP
        if (response.status === 401) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (response.status === 404) {
          throw new Error('Service de connexion indisponible');
        } else if (response.status === 500) {
          throw new Error('Erreur interne du serveur');
        } else {
          throw new Error(responseData.message || `Erreur ${response.status}`);
        }
      }

      // Validation des données reçues
      if (!responseData.user) {
        throw new Error('Données utilisateur manquantes dans la réponse');
      }

      if (!responseData.token) {
        throw new Error('Token manquant dans la réponse');
      }

      if (!responseData.user.role) {
        throw new Error('Rôle utilisateur manquant');
      }

      // ✅ CORRECTION: Utiliser _id au lieu de id
      const userId = responseData.user._id || responseData.user.id;
      if (!userId) {
        throw new Error('ID utilisateur manquant dans la réponse');
      }

      const { token, user } = responseData;

      // ✅ DEBUG COMPLET DU RÔLE
      console.log('🔍 [DEBUG RÔLE] ============ DÉBUT ANALYSE RÔLE ============');
      console.log('🔍 [DEBUG RÔLE] Rôle reçu du backend:', user.role);
      console.log('🔍 [DEBUG RÔLE] Type du rôle:', typeof user.role);
      console.log('🔍 [DEBUG RÔLE] Données utilisateur complètes:', user);
      console.log('🔍 [DEBUG RÔLE] Token reçu:', token ? `${token.substring(0, 50)}...` : 'Aucun');

      // ✅ MAPPING DES RÔLES AVEC FALLBACKS COMPLETS
      const roleMapping: { [key: string]: 'Admin' | 'Technicien' | 'Employé' } = {
        // Admin variations
        'admin': 'Admin',
        'administrateur': 'Admin',
        'administrator': 'Admin',
        'superadmin': 'Admin',
        'super Admin': 'Admin',
        
        // Technicien variations
        'technicien': 'Technicien',
        'technician': 'Technicien',
        'tech': 'Technicien',
        
        // Employé variations
        'employe': 'Employé',
        'employee': 'Employé',
        'employé': 'Employé',
        'user': 'Employé',
        'utilisateur': 'Employé',
        'default': 'Employé'
      };

      // Normaliser le rôle du backend
      const normalizedBackendRole = (user.role || '').toLowerCase().trim();
      const userRole = roleMapping[normalizedBackendRole] || 'Employé';

      console.log('🔄 [ROLE MAPPING] Résultat:', {
        backendRole: user.role,
        normalizedBackendRole: normalizedBackendRole,
        frontendRole: userRole,
        mappingUsed: roleMapping[normalizedBackendRole] ? `OUI (${normalizedBackendRole} → ${userRole})` : 'NON (fallback Employé)',
        availableMappings: Object.keys(roleMapping)
      });

      console.log('🔍 [DEBUG RÔLE] ============ FIN ANALYSE RÔLE ============');

      // ✅ STOCKAGE DANS localStorage AVEC LOGS
      console.log('💾 [STORAGE] Stockage des données dans localStorage...');
      
      localStorage.clear();
      localStorage.setItem('authToken', token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('user', JSON.stringify({
        _id: userId,
        id: userId,
        name: user.name,
        email: user.email,
        role: userRole
      }));

      // Vérifier le stockage
      const storedRole = localStorage.getItem('userRole');
      const storedUser = localStorage.getItem('user');
      console.log('💾 [STORAGE] Vérification:', {
        storedRole: storedRole,
        storedUser: storedUser ? JSON.parse(storedUser) : 'Aucun'
      });

      console.log('[LOGIN] ✓ Données validées:', {
        userId: userId,
        userName: user.name,
        userEmail: user.email,
        backendRole: user.role,
        frontendRole: userRole,
        tokenLength: token.length
      });

      // ✅ Appeler onLogin avec les bonnes données
      console.log('🎯 [ONLOGIN] Appel de onLogin avec rôle:', userRole);
      onLogin(userRole, token, {
        _id: userId,
        name: user.name,
        email: user.email,
        role: userRole
      });

      console.log('[LOGIN] ✓ Connexion réussie, redirection vers /dashboard');
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('[LOGIN] ✗ Erreur détaillée:', err);
      
      // Gestion spécifique des erreurs
      if (err.message.includes('Failed to fetch') || err.message.includes('Connection refused')) {
        setError('Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur le port 8000.');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Erreur réseau. Vérifiez votre connexion internet et que le serveur est accessible.');
      } else if (err.message.includes('Email ou mot de passe incorrect')) {
        setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
      } else {
        setError(err.message || 'Une erreur inattendue est survenue lors de la connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-indigo-900 flex justify-center items-center px-4 relative overflow-hidden text-white">
      {/* Curseur lumineux bleu qui suit la souris */}
      <div
        className="fixed w-6 h-6 rounded-full bg-blue-500/30 pointer-events-none z-50 transition-transform duration-100 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.5)',
        }}
      />

      {/* Particules pulsantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(particlesCount)].map((_, i) => (
          <span
            key={i}
            className="absolute w-2 h-2 rounded-full bg-blue-400/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Form container avec animation */}
      <motion.div
        className="max-w-md w-full bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-700/50 overflow-hidden p-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header avec bouton retour */}
        <header className="relative bg-transparent py-8 px-6 text-center rounded-t-2xl mb-4">
          <button
            onClick={handleBackToHome}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-all duration-300 hover:scale-110 bg-white/10 p-2 rounded-full"
            title="Retour à l'accueil"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-3xl font-black mb-1 text-white">GPIT</h2>
            <p className="text-blue-200 text-sm">Gestion du Parc Informatique en Tunisie</p>
          </div>
        </header>

        {/* Formulaire principal */}
        <main className="px-2">
          <h3 className="text-2xl font-bold mb-6 text-center text-white">Connexion à votre compte</h3>

          {error && (
            <div className={`mb-6 border px-4 py-3 rounded-xl backdrop-blur-sm text-sm ${
              error.includes('remplies') 
                ? 'bg-blue-900/70 border-blue-500/70 text-blue-200'
                : 'bg-red-900/70 border-red-500/70 text-red-200'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Champ Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-blue-300">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full rounded-xl border border-gray-600/60 bg-gray-900/50 py-3 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 transition-all duration-200"
                  autoComplete="email"
                  aria-label="Adresse email"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-blue-300">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full rounded-xl border border-gray-600/60 bg-gray-900/50 py-3 px-4 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 transition-all duration-200"
                  autoComplete="current-password"
                  aria-label="Mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg transition-all duration-300 transform ${
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-blue-500 hover:to-blue-400 hover:scale-[1.02] hover:shadow-xl active:scale-100'
              }`}
              aria-busy={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Lien d'inscription */}
          <div className="mt-8 text-center">
            <p className="text-blue-300 text-sm">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-white hover:text-blue-200 underline transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </main>

        {/* Éléments de décoration */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
      </motion.div>
    </div>
  );
}

export default Login;