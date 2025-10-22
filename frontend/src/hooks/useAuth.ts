import { useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        console.log('✅ Utilisateur authentifié:', JSON.parse(userData).name);
      } catch (error) {
        console.error('❌ Erreur parsing user data:', error);
        logout();
      }
    } else {
      console.log('🔐 Aucune session active trouvée');
    }
    setLoading(false);
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('🔐 Connexion réussie:', userData.name);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('🔒 Déconnexion effectuée');
    window.location.href = '/login';
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    getToken,
    checkAuth
  };
};