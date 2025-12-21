import { useState, useEffect, useCallback } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour vérifier l'authentification
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;

        // Optionnel : vérifier si le token est expiré (si tu as un champ exp dans le JWT)
        // try {
        //   const payload = JSON.parse(atob(token.split('.')[1]));
        //   if (payload.exp * 1000 < Date.now()) {
        //     logout();
        //     return;
        //   }
        // } catch {}

        setUser(parsedUser);
        console.log('✅ Utilisateur authentifié:', parsedUser.name);
      } catch (error) {
        console.error('❌ Erreur lors du parsing des données utilisateur:', error);
        logout(); // Nettoie si données corrompues
      }
    } else {
      console.log('🔐 Aucune session active trouvée');
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Vérifier l'auth au montage + écouter les changements dans localStorage (utile si plusieurs onglets)
  useEffect(() => {
    checkAuth();

    // Écouter les changements dans localStorage (ex: déconnexion dans un autre onglet)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('🔐 Connexion réussie:', userData.name);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('🔒 Déconnexion effectuée');
    // Redirection propre sans recharger toute la page si tu utilises React Router
    // window.location.href = '/login';  → à éviter si possible
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem('token');
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  return {
    user,
    setUser,              // Utile si tu veux mettre à jour le profil (ex: changement de rôle)
    loading,
    login,
    logout,
    isAuthenticated,
    getToken,
    checkAuth,            // Permet de rafraîchir manuellement (ex: après mise à jour profil)
  };
};