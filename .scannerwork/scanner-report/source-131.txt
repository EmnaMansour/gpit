import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/Layout/PublicLayout';
import AuthLayout from './components/Layout/AuthLayout';
import Layout from './components/Layout/Layout'; // Dashboard layout
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/Equipment/EquipmentList';
import IncidentList from './pages/Incidents/IncidentList';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import NotAuthorized from './pages/NotAuthorized';
import ProtectedRoute from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { About } from './pages/About';
import Contact from './pages/Contact';
import Features from './pages/Features';

// Types pour l'utilisateur
type User = {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Technicien' | 'Employé';
};

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'Admin' | 'Technicien' | 'Employé' | ''>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Charger les données au montage
  useEffect(() => {
    const storedAuthStatus = localStorage.getItem('isAuthenticated');
    const storedRole = localStorage.getItem('userRole');
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');

    console.log('[APP] Chargement des données stockées:', {
      isAuthenticated: storedAuthStatus,
      role: storedRole,
      hasToken: !!storedToken,
      hasUser: !!storedUser
    });

    if (storedAuthStatus === 'true' && storedToken) {
      setIsAuthenticated(true);
      
      if (storedRole === 'Admin' || storedRole === 'Technicien' || storedRole === 'Employé') {
        setUserRole(storedRole);
      }

      // Restaurer le token
      setAuthToken(storedToken);
      console.log('[APP] ✓ Token restauré');

      // Restaurer l'utilisateur
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          console.log('[APP] ✓ Utilisateur restauré:', user.email);
        } catch (error) {
          console.error('[APP] ✗ Erreur parsing utilisateur:', error);
        }
      }
    }
  }, []);

  const handleLogin = (
    role: 'Admin' | 'Technicien' | 'Employé',
    token: string,
    user: User
  ) => {
    console.log('[APP] Login effectué pour:', user.email, 'Role:', role);

    setIsAuthenticated(true);
    setUserRole(role);
    setAuthToken(token);
    setCurrentUser(user);

    // Stocker en localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    console.log('[APP] ✓ Données sauvegardées en localStorage');
  };

  const handleLogout = () => {
    console.log('[APP] Logout effectué');

    setIsAuthenticated(false);
    setUserRole('');
    setAuthToken(null);
    setCurrentUser(null);

    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    console.log('[APP] ✓ localStorage nettoyé');
  };

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        {/* Pages publiques avec Header/Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Pages Auth (Login/Register) sans Header/Footer */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            }
          />
        </Route>

        {/* Pages privées */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              allowedRoles={['Admin', 'Technicien', 'Employé']}
              userRole={userRole}
            >
              <Layout userRole={userRole} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <Dashboard
                userRole={userRole}
                currentUser={currentUser}
                authToken={authToken}
              />
            }
          />
         <Route
  path="/equipment"
  element={
    <EquipmentList
      userRole={userRole}
      currentUser={currentUser}
      authToken={authToken}
    />
  }
/>
          <Route
            path="/incidents"
            element={
              <IncidentList
                userRole={userRole}
                currentUser={currentUser}
                authToken={authToken}
              />
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                allowedRoles={['Admin']}
                userRole={userRole}
              >
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                allowedRoles={['Admin', 'Technicien']}
                userRole={userRole}
              >
                <Reports authToken={authToken} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Accès non autorisé */}
        <Route path="/not-authorized" element={<NotAuthorized />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;