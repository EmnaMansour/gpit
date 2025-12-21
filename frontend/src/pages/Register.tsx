import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  LockIcon, 
  MailIcon, 
  PhoneIcon, 
  BuildingIcon,
  ArrowLeftIcon, 
  EyeIcon, 
  EyeOffIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ShieldIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: [0.25, 0.46, 0.45, 0.94] // easeOut
    } 
  },
};

const toastVariants: Variants = {
  hidden: { opacity: 0, y: -50, scale: 0.8 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94] // easeOut
    } 
  },
  exit: { 
    opacity: 0, 
    y: -50, 
    scale: 0.8, 
    transition: { 
      duration: 0.3,
      ease: [0.55, 0.085, 0.68, 0.53] // easeIn
    } 
  }
};

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    HEALTH: '/health',
    REGISTER: '/users/register',
  }
};

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'employe' | 'technicien';
  phone: string;
  department: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    department?: string;
    phone?: string;
  };
}

const Register = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // 👈 AJOUTÉ
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employe'as const,
    phone: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    checkServerStatus();
    
    // 👇 AJOUTÉ - Tracking de la souris
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const checkServerStatus = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const isOnline = response.ok;
      setServerOnline(isOnline);
      return isOnline;
    } catch (error) {
      setServerOnline(false);
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    if (error) setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Le nom complet est requis";
    if (!formData.email.trim()) return "L'email professionnel est requis";
    if (!formData.password) return "Le mot de passe est requis";
    if (!formData.confirmPassword) return "La confirmation du mot de passe est requise";
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Format d'email professionnel invalide";
    }
    
    if (formData.password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères";
    }
    
    if (formData.password !== formData.confirmPassword) {
      return "Les mots de passe ne correspondent pas";
    }
    
    if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      return "Format de téléphone invalide";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      const isOnline = await checkServerStatus();
      if (!isOnline) {
        throw new Error(
          "Serveur indisponible.\n\n" +
          "Vérifiez que le serveur backend est démarré sur le port 8000."
        );
      }

      const requestBody = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        phone: formData.phone.trim(),
        department: formData.department.trim()
      };

      console.log('📤 Envoi demande d\'inscription:', requestBody);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          const textError = await response.text();
          errorMessage = textError || errorMessage;
        }

        if (response.status === 400) {
          errorMessage = "Données invalides: " + errorMessage;
        } else if (response.status === 409) {
          errorMessage = "Un compte avec cet email existe déjà";
        } else if (response.status === 500) {
          errorMessage = "Erreur interne du serveur. Contactez l'administrateur.";
        }

        throw new Error(errorMessage);
      }

      const responseData: RegisterResponse = await response.json();
      console.log('✅ Réponse inscription:', responseData);

      if (!responseData.success) {
        throw new Error(responseData.message || "Erreur lors de la demande d'inscription");
      }

      setSuccessMessage(
        "✅ Demande d'inscription envoyée avec succès !\n\n" +
        "📧 L'administrateur a été notifié de votre demande.\n" +
        "⏳ Votre compte sera activé après validation manuelle.\n" +
        "📞 Vous recevrez une confirmation par email une fois approuvé.\n\n" +
        "Merci de votre patience."
      );
      setShowSuccess(true);

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employe',
        phone: '',
        department: ''
      });

      setTimeout(() => {
        navigate('/login');
      }, 10000);

    } catch (err: any) {
      console.error('❌ Erreur inscription:', err);
      
      let errorMessage = err.message || "Une erreur inattendue est survenue";

      if (err.name === 'AbortError') {
        errorMessage = "Délai d'attente dépassé. Le serveur met trop de temps à répondre.";
      } else if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = "Impossible de se connecter au serveur backend.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email) {
        setError("Le nom et l'email sont requis pour continuer");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Format d'email invalide");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
    setError('');
  };
const particlesCount = 30;
 
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-indigo-900 flex justify-center items-center px-4 relative overflow-hidden text-white">
      {/* 👇 CURSEUR LUMINEUX BLEU */}
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

      {/* Toast de succès */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-xl shadow-2xl border border-green-400/50 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-white font-medium block">Demande Envoyée !</span>
                  <span className="text-white/90 text-sm block mt-1 whitespace-pre-line">
                    {successMessage}
                  </span>
                  <div className="mt-3 p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <ShieldIcon className="h-4 w-4" />
                      <span>Statut: En attente de validation administrateur</span>
                    </div>
                  </div>
                  <span className="text-white/80 text-xs block mt-2">
                    Redirection automatique dans 10 secondes...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Formulaire principal */}
      <motion.div
        className="max-w-md w-full max-h-[90vh] bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-700/50 overflow-hidden p-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <header className="relative py-6 text-center mb-4">
          <button
            onClick={handleBackToHome}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-all duration-300 hover:scale-110 bg-white/10 p-2 rounded-full"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-3xl font-black mb-1 text-white">GPIT</h2>
            <p className="text-blue-200 text-sm">Gestion du Parc Informatique</p>
          </div>
        </header>

        {/* Indicateur d'étape */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep >= step 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    currentStep > step ? 'bg-blue-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu défilable */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-2 py-2">
          <main className="px-2">
            <h3 className="text-2xl font-bold mb-2 text-center text-white">
              {currentStep === 1 && "Informations Personnelles"}
              {currentStep === 2 && "Sécurité du Compte"}
              {currentStep === 3 && "Validation Finale"}
            </h3>

            <p className="text-blue-200 text-center text-sm mb-6">
              Étape {currentStep} sur 3
            </p>

            {/* Information validation admin */}
            <div className="mb-6 bg-blue-900/40 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-xl text-sm">
              <div className="flex items-start gap-2">
                <ShieldIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Validation Administrateur Requise</strong>
                  <p className="mt-1 text-xs">
                    Toutes les demandes sont vérifiées manuellement par l'administrateur 
                    pour assurer la sécurité de la plateforme.
                  </p>
                </div>
              </div>
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className="mb-6 bg-red-900/70 border border-red-500/70 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* ÉTAPE 1: Informations personnelles */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-blue-300">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom complet"
                        required
                        className="w-full rounded-xl border border-gray-600 bg-gray-900/50 py-3 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-blue-300">
                      Email professionnel *
                    </label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@entreprise.com"
                        required
                        className="w-full rounded-xl border border-gray-600 bg-gray-900/50 py-3 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-blue-300">
                      Téléphone
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+216 XX XXX XXX"
                        className="w-full rounded-xl border border-gray-600 bg-gray-900/50 py-3 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="department" className="block text-sm font-medium text-blue-300">
                      Département / Service
                    </label>
                    <div className="relative">
                      <BuildingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <input
                        id="department"
                        name="department"
                        type="text"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="IT, RH, Commercial..."
                        className="w-full rounded-xl border border-gray-600 bg-gray-900/50 py-3 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ÉTAPE 2: Sécurité */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                 <div className="space-y-2">
  <label className="block text-sm font-medium text-blue-300">
    Type de compte
  </label>
  <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-600/60 rounded-xl px-5 py-4 backdrop-blur-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white font-semibold text-lg">Employé</p>
        <p className="text-blue-200 text-xs mt-1 leading-relaxed">
          Seuls les employés peuvent s’inscrire via ce formulaire.<br />
          Les comptes <span className="font-medium">Technicien</span> sont créés exclusivement par l’administrateur.
        </p>
      </div>
      <div className="text-blue-400">
        <UserIcon className="h-10 w-10 opacity-70" />
      </div>
    </div>
  </div>

  {/* Champ caché pour envoyer le rôle au backend */}
  <input type="hidden" name="role" value="employe" />
</div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-blue-300">
                      Mot de passe (min. 6 caractères) *
                    </label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Votre mot de passe sécurisé"
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-gray-600 bg-gray-900/50 py-3 px-4 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-300">
                      Confirmer le mot de passe *
                    </label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmez votre mot de passe"
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-gray-600 bg-gray-900/50 py-3 px-4 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ÉTAPE 3: Récapitulatif */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-300 mb-3">Récapitulatif de votre demande</h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Nom:</span>
                        <span className="text-white">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Email:</span>
                        <span className="text-white">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Téléphone:</span>
                        <span className="text-white">{formData.phone || 'Non spécifié'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Département:</span>
                        <span className="text-white">{formData.department || 'Non spécifié'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Type de compte:</span>
                        <span className="text-white capitalize">{formData.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <ClockIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-200 text-sm font-medium">Validation Administrateur</p>
                        <p className="text-yellow-200/80 text-xs mt-1">
                          Votre demande sera examinée manuellement par l'administrateur. 
                          Vous recevrez une notification une fois votre compte approuvé.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Boutons de navigation */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gray-600 hover:bg-gray-500 transition-all duration-300"
                    disabled={loading}
                  >
                    Retour
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-300"
                    disabled={loading}
                  >
                    Continuer
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || serverOnline === false}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi en cours...
                      </div>
                    ) : (
                      'Envoyer la demande'
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Lien vers connexion */}
            <div className="mt-6 text-center">
              <p className="text-blue-300 text-sm">
                Déjà inscrit ?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-white hover:text-blue-200 underline transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;