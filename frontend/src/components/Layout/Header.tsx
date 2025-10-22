import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  LogOutIcon, 
  MenuIcon, 
  LayoutDashboardIcon, 
  MonitorIcon, 
  AlertCircleIcon, 
  UsersIcon, 
  FileTextIcon,
  XIcon,
  MailIcon,
  BellIcon,
  ChevronRightIcon,
  EyeIcon,
  CheckCircleIcon,
  MessageCircleIcon
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import useContactNotifications from '../../hooks/useContactNotifications';

interface HeaderProps {
  userRole: 'Admin' | 'Technicien' | 'Employé';
  onLogout: () => void;
  currentUser?: {
    _id: string;
    name: string;
    email: string;
  };
  token?: string;
}

// Composant Modal pour afficher les messages
const NotificationModal: React.FC<{
  notification: any;
  onClose: () => void;
  onViewAll: () => void;
}> = ({ notification, onClose, onViewAll }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour formater le message avec des sauts de ligne
  const formatMessage = (message: string) => {
    if (!message) return 'Aucun message';
    
    return message.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/60 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl animate-in fade-in-zoom-in-95">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full p-3 shadow-lg">
              <MessageCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Message de contact</h3>
              <p className="text-cyan-400 text-sm">Formulaire de contact du site</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-300 p-2 rounded-full hover:bg-gray-700/50"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Contenu du message */}
        <div className="space-y-6">
          {/* Informations expéditeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
            <div className="space-y-3">
              <div>
                <label className="text-cyan-400 text-sm font-medium block mb-1">Expéditeur</label>
                <p className="text-white font-semibold text-lg">{notification.name || 'Non spécifié'}</p>
              </div>
              
              <div>
                <label className="text-cyan-400 text-sm font-medium block mb-1">Email</label>
                <p className="text-white text-md break-all">{notification.email || 'Non spécifié'}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-cyan-400 text-sm font-medium block mb-1">Date d'envoi</label>
                <p className="text-white text-sm">{formatDate(notification.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-cyan-400 text-sm font-medium block mb-1">Statut</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                  Nouveau message
                </span>
              </div>
            </div>
          </div>
          
          {/* Message */}
          <div className="bg-gray-800/20 rounded-xl border border-gray-700/30 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700/50 px-4 py-3 border-b border-gray-700/30">
              <h4 className="text-white font-semibold flex items-center">
                <MessageCircleIcon className="h-4 w-4 mr-2 text-cyan-400" />
                Contenu du message
              </h4>
            </div>
            
            <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {notification.message ? (
                    formatMessage(notification.message)
                  ) : (
                    <span className="text-gray-400 italic">Aucun message fourni</span>
                  )}
                </p>
              </div>
              
              {/* Indicateur de longueur */}
              {notification.message && notification.message.length > 500 && (
                <div className="mt-3 pt-3 border-t border-gray-700/30">
                  <p className="text-gray-400 text-xs">
                    Message long ({notification.message.length} caractères)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 mt-6 pt-6 border-t border-gray-700/50">
          <div className="text-gray-400 text-sm">
            Message reçu via le formulaire de contact public
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-gray-700/50 border border-gray-600/50 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ userRole, onLogout, currentUser, token }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Utilisation du hook de notifications
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead, 
    resetNotifications 
  } = useContactNotifications(userRole, token);

  // Synchroniser les notifications locales avec celles du hook
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setLocalNotifications(notifications);
      setLocalUnreadCount(unreadCount);
    }
  }, [notifications, unreadCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fermer le menu mobile quand la route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setNotificationMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotificationMenu = () => {
    setNotificationMenuOpen(!notificationMenuOpen);
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      // Marquer comme lu via l'API
      await markAsRead(notificationId);
      
      // Mettre à jour localement
      setLocalNotifications(prev => prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, status: 'read' }
          : notif
      ));
      
      setLocalUnreadCount(prev => Math.max(0, prev - 1));
      
      // Trouver la notification cliquée
      const notification = localNotifications.find(n => n._id === notificationId);
      if (notification) {
        setSelectedNotification(notification);
      }
      
      setNotificationMenuOpen(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback : afficher quand même la notification
      const notification = localNotifications.find(n => n._id === notificationId);
      if (notification) {
        setSelectedNotification(notification);
      }
      setNotificationMenuOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await resetNotifications();
      setLocalNotifications(prev => prev.map(notif => ({
        ...notif,
        status: 'read'
      })));
      setLocalUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleViewAllMessages = () => {
    navigate('/admin/contact');
    setNotificationMenuOpen(false);
  };

  const closeNotificationModal = () => {
    setSelectedNotification(null);
  };

  const handleViewInAdmin = () => {
    navigate('/admin/contact');
    setSelectedNotification(null);
  };

  const userRoleLabel = userRole === 'Admin' ? 'Administrateur'
    : userRole === 'Technicien' ? 'Technicien'
    : 'Employé';

  const getLinkClassName = (isActive: boolean): string =>
    `flex items-center py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold group relative overflow-hidden ${
      isActive 
        ? 'bg-gradient-to-r from-blue-600/30 to-blue-400/30 text-blue-400 border border-blue-500/50 shadow-2xl shadow-blue-500/20 backdrop-blur-sm' 
        : 'text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50'
    }`;

  const getMobileLinkClassName = (isActive: boolean): string =>
    `flex items-center py-4 px-6 rounded-xl transition-all duration-300 text-base font-medium ${
      isActive 
        ? 'bg-gradient-to-r from-blue-600/40 to-blue-400/40 text-blue-400 border border-blue-500/50 shadow-lg' 
        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
    }`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const displayNotifications = localNotifications.length > 0 ? localNotifications : notifications;
  const displayUnreadCount = localUnreadCount > 0 ? localUnreadCount : unreadCount;

  // Navigation mobile
  const mobileNavLinks = [
    { to: "/dashboard", icon: LayoutDashboardIcon, label: "Tableau de bord" },
    { to: "/equipment", icon: MonitorIcon, label: "Équipements" },
    { to: "/incidents", icon: AlertCircleIcon, label: "Incidents" },
    ...(userRole === 'Admin' ? [{ to: "/users", icon: UsersIcon, label: "Utilisateurs" }] : []),
    ...((userRole === 'Admin' || userRole === 'Technicien') ? [{ to: "/reports", icon: FileTextIcon, label: "Rapports" }] : []),
    ...(userRole === 'Admin' ? [{ to: "/admin/contact", icon: MailIcon, label: "Messages" }] : []),
  ];

  // Ajouter les styles CSS pour la scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(75, 85, 99, 0.1);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.3);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(139, 92, 246, 0.5);
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-2xl border-b border-gray-800/60 py-2 shadow-2xl' 
          : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-white via-blue-300 to-cyan-400 bg-clip-text text-transparent">
                  GPIT
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                  Gestion Parc Informatique En Tunisie
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 bg-black/60 backdrop-blur-2xl rounded-2xl p-1 border border-gray-800/50 shadow-2xl">
              <NavLink to="/dashboard" className={({ isActive }) => getLinkClassName(isActive)}>
                <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                Tableau de bord
              </NavLink>
              
              <NavLink to="/equipment" className={({ isActive }) => getLinkClassName(isActive)}>
                <MonitorIcon className="mr-2 h-4 w-4" />
                Équipements
              </NavLink>
              
              <NavLink to="/incidents" className={({ isActive }) => getLinkClassName(isActive)}>
                <AlertCircleIcon className="mr-2 h-4 w-4" />
                Incidents
              </NavLink>
              
              {userRole === 'Admin' && (
                <NavLink to="/users" className={({ isActive }) => getLinkClassName(isActive)}>
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Utilisateurs
                </NavLink>
              )}
              
              {(userRole === 'Admin' || userRole === 'Technicien') && (
                <NavLink to="/reports" className={({ isActive }) => getLinkClassName(isActive)}>
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  Rapports
                </NavLink>
              )}
            </nav>

            {/* User Info and Controls */}
            <div className="flex items-center space-x-3">
              {/* Notifications pour l'admin seulement */}
              {userRole === 'Admin' && (
                <div className="relative">
                  <button 
                    onClick={toggleNotificationMenu}
                    className={`p-2 rounded-xl border transition-all duration-300 hover:scale-105 relative group ${
                      notificationMenuOpen
                        ? 'bg-gradient-to-r from-cyan-600/30 to-blue-500/30 border-cyan-500/50 shadow-lg'
                        : 'bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border-blue-500/40 hover:border-blue-400/60'
                    }`}
                    title={`${displayUnreadCount} message(s) non lu(s)`}
                  >
                    {loading ? (
                      <div className="relative">
                        <BellIcon className="h-5 w-5 text-blue-400 animate-pulse" />
                        <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
                      </div>
                    ) : (
                      <MailIcon className="h-5 w-5 text-blue-400 group-hover:text-cyan-300 transition-colors" />
                    )}
                    
                    {displayUnreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce shadow-lg">
                        {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
                      </span>
                    )}
                  </button>

                  {/* Menu déroulant des notifications */}
                  {notificationMenuOpen && (
                    <div className="absolute right-0 top-12 w-96 bg-gray-900/95 backdrop-blur-2xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
                      {/* En-tête avec badge et actions */}
                      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 to-gray-800/80">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MailIcon className="h-5 w-5 text-cyan-400" />
                            <h3 className="text-white font-semibold text-lg">Messages de contact</h3>
                            {displayUnreadCount > 0 && (
                              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                {displayUnreadCount} nouveau{displayUnreadCount > 1 ? 'x' : ''}
                              </span>
                            )}
                          </div>
                          {displayUnreadCount > 0 && (
                            <button 
                              onClick={handleMarkAllAsRead}
                              className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group"
                              title="Marquer tous comme lus"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              <span>Tout marquer comme lu</span>
                            </button>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">Messages reçus via le formulaire de contact</p>
                      </div>
                      
                      {/* Liste des notifications */}
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {loading ? (
                          <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
                            <p className="text-gray-400 text-sm">Chargement des messages...</p>
                          </div>
                        ) : error ? (
                          <div className="p-6 text-center">
                            <AlertCircleIcon className="h-10 w-10 text-red-400 mx-auto mb-3" />
                            <p className="text-red-400 text-sm mb-2">{error}</p>
                            <button 
                              onClick={() => window.location.reload()}
                              className="text-cyan-400 hover:text-cyan-300 text-sm"
                            >
                              Réessayer
                            </button>
                          </div>
                        ) : displayNotifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                              <MailIcon className="h-8 w-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-sm">Aucun message pour le moment</p>
                            <p className="text-gray-500 text-xs mt-1">Les nouveaux messages apparaîtront ici</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-800/50">
                            {displayNotifications.map((notification) => (
                              <div 
                                key={notification._id}
                                className={`p-4 cursor-pointer transition-all duration-300 group hover:bg-gray-800/40 ${
                                  notification.status === 'new' 
                                    ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border-l-2 border-cyan-400' 
                                    : 'border-l-2 border-transparent'
                                }`}
                                onClick={() => handleNotificationClick(notification._id)}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                                      notification.status === 'new' 
                                        ? 'bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50' 
                                        : 'bg-gray-500'
                                    }`}></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-white font-semibold text-sm truncate">
                                          {notification.name}
                                        </span>
                                        {notification.status === 'new' && (
                                          <span className="bg-cyan-500/20 text-cyan-300 text-xs px-1.5 py-0.5 rounded-full">
                                            Nouveau
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-cyan-400 text-xs truncate">{notification.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                    <span className="text-gray-400 text-xs whitespace-nowrap">
                                      {formatShortDate(notification.createdAt)}
                                    </span>
                                    <span className="text-gray-500 text-xs mt-1">
                                      {formatDate(notification.createdAt).split(' ')[1]}
                                    </span>
                                  </div>
                                </div>
                                
                                <p className="text-gray-300 text-sm line-clamp-2 group-hover:text-gray-200 leading-relaxed">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between mt-3">
                                  <span className="text-gray-500 text-xs">
                                    {formatDate(notification.createdAt)}
                                  </span>
                                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <EyeIcon className="h-3 w-3 text-gray-400" />
                                    <ChevronRightIcon className="h-3 w-3 text-gray-400" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Pied de page avec bouton "Voir tous les messages"
                      {displayNotifications.length > 0 && (
                        <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-gray-800/30">
                          <button 
                            onClick={handleViewAllMessages}
                            className="w-full group flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-400/50 rounded-lg px-4 py-3 transition-all duration-300 hover:scale-[1.02]"
                          >
                            <EyeIcon className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300" />
                            <span className="text-cyan-400 group-hover:text-cyan-300 font-medium text-sm">
                              Voir tous les messages
                            </span>
                            <ChevronRightIcon className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300 transform group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )} */}
                    </div>
                  )}
                </div>
              )}

              {/* User Info */}
              <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-gray-900/80 to-gray-800/60 rounded-xl px-4 py-2 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group">
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full p-1.5 shadow-lg">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-semibold">
                    {currentUser?.name || userRoleLabel}
                  </div>
                  <div className="text-gray-400 text-xs flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    {userRoleLabel}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={onLogout}
                className="group relative bg-gradient-to-r from-red-600/20 to-red-500/20 hover:from-red-600/30 hover:to-red-500/30 border border-red-500/40 rounded-xl p-3 transition-all duration-300 hover:scale-105"
                title="Déconnexion"
              >
                <LogOutIcon className="h-4 w-4 text-red-400 group-hover:text-red-300" />
              </button>

              {/* Mobile menu button */}
              <button 
                onClick={toggleMobileMenu}
                className="lg:hidden group bg-gray-900/50 border border-gray-800/50 rounded-xl p-3 transition-all duration-300 hover:scale-105 hover:border-gray-700/50"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
                ) : (
                  <MenuIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-500 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <div className="bg-gradient-to-b from-black/90 to-gray-900/80 rounded-2xl p-4 border border-gray-800/50">
              <nav className="space-y-2">
                {mobileNavLinks.map((link) => (
                  <NavLink 
                    key={link.to}
                    to={link.to} 
                    className={({ isActive }) => getMobileLinkClassName(isActive)}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="mr-3 h-5 w-5" />
                    {link.label}
                    {link.to === "/admin/contact" && displayUnreadCount > 0 && (
                      <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {displayUnreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Mobile user info */}
              <div className="pt-4 mt-4 border-t border-gray-800/50">
                <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/30 rounded-xl">
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full p-2">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">
                      {currentUser?.name || userRoleLabel}
                    </div>
                    <div className="text-gray-400 text-xs flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      {userRoleLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay pour fermer le menu notification */}
        {notificationMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setNotificationMenuOpen(false)}
          />
        )}
      </header>

      {/* Modal pour afficher la notification */}
      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          onClose={closeNotificationModal}
          onViewAll={handleViewInAdmin}
        />
      )}
    </>
  );
};

export default Header;