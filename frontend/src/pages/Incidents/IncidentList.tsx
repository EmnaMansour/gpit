import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  SearchIcon,
  PlusIcon,
  FilterIcon,
  PencilIcon,
  TrashIcon,
  AlertCircle,
  RefreshCw,
  CalendarIcon,
  PackageIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  UserIcon,
  ShieldIcon
} from 'lucide-react';
import IncidentModal from '../../components/modals/IncidentModal';

const API_BASE_URL = 'http://localhost:8000';



interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface Equipment {
  _id: string;
  name: string;
  nom?: string;
  type: string;
  location?: string;
}

interface Incident {
  _id: string;
  title: string;
  description: string;
  equipment: string | Equipment | null;
  status: 'Nouveau' | 'En cours' | 'Résolu';
  priority: 'Basse' | 'Moyenne' | 'Élevée';
  reportedBy: string | User | null;
  createdAt: string;
  updatedAt: string;
}

interface IncidentListProps {
  userRole: string;
  currentUser?: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  authToken?: string;
}

const ApiErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 text-center">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4 text-white">Service indisponible</h2>
      <p className="text-gray-300 mb-6">
        Impossible de se connecter au serveur API. Vérifiez que votre backend est démarré.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105"
      >
        <RefreshCw className="h-4 w-4 inline mr-2" />
        Réessayer
      </button>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-black text-white pt-20 px-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="animate-pulse bg-gray-700 h-10 w-1/3 rounded-xl"></div>
        <div className="animate-pulse bg-gray-700 h-12 w-48 rounded-xl"></div>
      </div>
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-700 rounded-xl w-full"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const IncidentList: React.FC<IncidentListProps> = ({ userRole, currentUser, authToken }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletedIncidents, setDeletedIncidents] = useState<Set<string>>(new Set());

  // Normaliser le rôle
  const normalizedRole = userRole?.toLowerCase() || 'employé';
  const isAdmin = normalizedRole === 'admin' || normalizedRole === 'administrateur';
  const isTechnicien = normalizedRole === 'technicien' || normalizedRole === 'technician';
  const isEmploye = normalizedRole === 'employé' || normalizedRole === 'employee' || normalizedRole === 'employe';

  // Créer l'instance axios
const createAxiosInstance = useCallback(() => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('[INCIDENTLIST] authToken:', authToken ? 'PRÉSENT' : 'ABSENT');
  console.log('[INCIDENTLIST] authToken longueur:', authToken?.length);
  console.log('[INCIDENTLIST] authToken début:', authToken?.substring(0, 20));
  
  if (authToken && typeof authToken === 'string' && authToken.trim()) {
    const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    instance.defaults.headers.common['Authorization'] = token;
    console.log('[INCIDENTLIST] ✓ Header Authorization défini:', token.substring(0, 30) + '...');
  } else {
    console.log('[INCIDENTLIST] ✗ Aucun token disponible');
    delete instance.defaults.headers.common['Authorization'];
  }

  // ========== INTERCEPTEURS POUR DÉBOGUER ==========
  
  // Intercepteur de requête
  instance.interceptors.request.use(
    (config) => {
      console.log('[INCIDENTLIST] → Requête:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        baseURL: config.baseURL,
        headers: {
          ...config.headers,
          // Masquer le token complet pour la sécurité
          Authorization: config.headers.Authorization 
            ? `${config.headers.Authorization.substring(0, 30)}...` 
            : 'Non défini'
        }
      });
      return config;
    },
    (error) => {
      console.error('[INCIDENTLIST] ✗ Erreur requête:', error);
      return Promise.reject(error);
    }
  );

  // Intercepteur de réponse
  instance.interceptors.response.use(
    (response) => {
      console.log('[INCIDENTLIST] ← Réponse:', {
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        dataLength: Array.isArray(response.data) 
          ? `${response.data.length} éléments` 
          : typeof response.data === 'object'
            ? 'Object JSON'
            : 'Autre'
      });
      return response;
    },
    (error) => {
      console.error('[INCIDENTLIST] ✗ Erreur réponse:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        configHeaders: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization
            ? `${error.config.headers.Authorization.substring(0, 30)}...`
            : 'Non défini'
        }
      });
      return Promise.reject(error);
    }
  );

  return instance;
}, [authToken]);
  // FONCTION POUR EXTRAIRE L'ID DE reportedBy
  const getReportedById = (reportedBy: string | User | null): string | null => {
    if (!reportedBy) return null;
    if (typeof reportedBy === 'string') return reportedBy;
    if (typeof reportedBy === 'object' && reportedBy._id) return reportedBy._id;
    return null;
  };

  // PERMISSIONS CORRIGÉES
  const canAddIncident = (): boolean => {
    return isAdmin || isTechnicien || isEmploye;
  };

  const canEditIncident = (incident: Incident): boolean => {
    if (isAdmin) return true;
    if (isTechnicien) return true;
    if (isEmploye) {
      const reportedById = getReportedById(incident.reportedBy);
      return reportedById === currentUser?._id;
    }
    return false;
  };

  const canDeleteIncident = (incident: Incident): boolean => {
    // SEULEMENT LES ADMINS PEUVENT SUPPRIMER
    if (isAdmin) return true;
    
    // Techniciens NE PEUVENT PAS supprimer
    if (isTechnicien) return false;
    
    // Employés peuvent supprimer leurs propres incidents
    if (isEmploye) {
      const reportedById = getReportedById(incident.reportedBy);
      return reportedById === currentUser?._id;
    }
    
    return false;
  };

  const canResolveIncident = (incident: Incident): boolean => {
    if (isAdmin) return true;
    if (isTechnicien) return true;
    return false;
  };

  // FILTRER LES INCIDENTS PAR RÔLE
  const filterIncidentsByRole = useCallback((incidentsToFilter: Incident[]): Incident[] => {
    if (!currentUser) return [];

    if (isAdmin || isTechnicien) {
      return incidentsToFilter;
    } else if (isEmploye) {
      return incidentsToFilter.filter(incident => {
        const reportedById = getReportedById(incident.reportedBy);
        return reportedById === currentUser._id;
      });
    }
    
    return [];
  }, [currentUser, isAdmin, isTechnicien, isEmploye]);

  // SUPPRESSION FRONTEND
  const handleDeleteIncidentFrontend = useCallback((incidentId: string) => {
    setDeletedIncidents(prev => new Set(prev).add(incidentId));
    setIncidents(prev => prev.filter(incident => incident._id !== incidentId));
    return true;
  }, []);

  // RÉSOUDRE ET SUPPRIMER DIRECTEMENT
  const handleResolveAndDelete = async (incident: Incident) => {
    if (!canResolveIncident(incident)) {
      alert('Vous n\'avez pas la permission de résoudre cet incident.');
      return;
    }

    try {
      if (incident.status !== 'Résolu') {
        const axiosInstance = createAxiosInstance();
        const updateData = {
          ...incident,
          status: 'Résolu',
          equipment: typeof incident.equipment === 'object' ? incident.equipment?._id : incident.equipment,
          reportedBy: typeof incident.reportedBy === 'object' ? incident.reportedBy?._id : incident.reportedBy
        };
        
        try {
          await axiosInstance.put(`/api/incidents/${incident._id}`, updateData);
        } catch (err: any) {
          console.warn('⚠️ Impossible de marquer comme résolu côté backend:', err.message);
        }
      }

      handleDeleteIncidentFrontend(incident._id);
      console.log(`✅ Incident "${incident.title}" résolu et supprimé`);
      
    } catch (err: any) {
      console.error('❌ Erreur résolution + suppression:', err);
      setError('Erreur lors de la résolution et suppression de l\'incident');
    }
  };

  // SUPPRIMER UN INCIDENT
  const handleDelete = async (incident: Incident) => {
    if (!canDeleteIncident(incident)) {
      alert('Vous n\'avez pas la permission de supprimer cet incident.');
      return;
    }

    if (!window.confirm('Voulez-vous vraiment supprimer cet incident ?')) {
      return;
    }

    try {
      const axiosInstance = createAxiosInstance();
      try {
        await axiosInstance.delete(`/api/incidents/${incident._id}`);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          console.warn('⚠️ Endpoint DELETE non disponible, suppression frontend seulement');
        } else {
          throw err;
        }
      }

      handleDeleteIncidentFrontend(incident._id);
      
    } catch (err: any) {
      console.error('❌ Erreur suppression:', err);
      handleDeleteIncidentFrontend(incident._id);
      setError('Incident supprimé de l\'interface mais erreur côté serveur.');
    }
  };

  // RÉCUPÉRER LE NOM DE L'ÉQUIPEMENT
  const getEquipmentName = (equipment: string | Equipment | null | undefined): string => {
    if (!equipment) return 'Aucun équipement';
    
    if (typeof equipment === 'string') {
      if (!equipment.trim()) return 'ID équipement vide';
      const found = equipmentList.find((eq) => eq._id === equipment);
      if (found) return found.name || found.nom || `Équipement ${found._id.substring(0, 8)}...`;
      if (equipment.length > 10) return 'Équipement non trouvé';
      return equipment;
    }
    
    if (typeof equipment === 'object' && equipment !== null) {
      return equipment.name || equipment.nom || equipment._id || 'Équipement sans nom';
    }
    
    return 'Format inconnu';
  };

  // RÉCUPÉRER LES DONNÉES
  const fetchData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const axiosInstance = createAxiosInstance();

      const [usersResponse, equipmentResponse, incidentsResponse] = await Promise.allSettled([
        axiosInstance.get('/api/utilisateur'),
        axiosInstance.get('/api/equipements'),
        axiosInstance.get('/api/incidents')
      ]);

      // Utilisateurs
      if (usersResponse.status === 'fulfilled') {
        const userData = Array.isArray(usersResponse.value.data) ? usersResponse.value.data : [];
        setUserList(
          userData.map((item: any) => ({
            _id: item._id || '',
            name: item.name || item.nom || item.username || 'Utilisateur',
            email: item.email || '',
            role: item.role || ''
          }))
        );
      } else {
        console.warn('[API] Erreur utilisateurs:', usersResponse.reason);
        setUserList([]);
      }

      // Équipements
      if (equipmentResponse.status === 'fulfilled') {
        const equipData = Array.isArray(equipmentResponse.value.data) ? equipmentResponse.value.data : [];
        const mappedEquipment = equipData.map((item: any) => ({
          _id: item._id || '',
          name: item.nom || item.name || 'Équipement sans nom',
          nom: item.nom || item.name || 'Équipement sans nom',
          type: item.type || '',
          location: item.location || item.localisation || ''
        }));
        setEquipmentList(mappedEquipment);
      } else {
        console.warn('[API] Erreur équipements:', equipmentResponse.reason);
        setEquipmentList([]);
      }

      // Incidents
      if (incidentsResponse.status === 'fulfilled') {
        let incidentData = [];
        const responseData = incidentsResponse.value.data;

        if (Array.isArray(responseData)) {
          incidentData = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          incidentData = responseData.data;
        } else if (responseData && Array.isArray(responseData.incidents)) {
          incidentData = responseData.incidents;
        } else {
          incidentData = responseData?.incidents || responseData?.data || [];
        }

        const transformedIncidents = incidentData.map((item: any, index: number) => ({
          _id: item._id || `temp-${Date.now()}-${index}`,
          title: item.title || item.titre || 'Sans titre',
          description: item.description || '',
          equipment: item.equipment || item.equipement || null,
          status: ['Nouveau', 'En cours', 'Résolu'].includes(item.status) ? item.status : 'Nouveau',
          priority: ['Basse', 'Moyenne', 'Élevée', 'Haute'].includes(item.priority) ? item.priority : 'Moyenne',
          reportedBy: item.reportedBy || item.createdBy || currentUser || null,
          createdAt: item.createdAt || item.createdDate || new Date().toISOString(),
          updatedAt: item.updatedAt || item.updatedDate || new Date().toISOString()
        }));

        const filteredIncidents = transformedIncidents.filter(
          incident => !deletedIncidents.has(incident._id)
        );

        setIncidents(filteredIncidents);
        setApiAvailable(true);
        
      } else {
        console.error('❌ Erreur incidents:', incidentsResponse.reason);
        throw incidentsResponse.reason;
      }

    } catch (err) {
      console.error('[API] ✗ Erreur:', err);
      setApiAvailable(false);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [createAxiosInstance, currentUser, deletedIncidents]);

  // EFFECT POUR CHARGER LES DONNÉES
  useEffect(() => {
    fetchData();
  }, [authToken, fetchData]);

  // RÉCUPÉRER LE NOM DE L'UTILISATEUR
  const getUserName = (user: string | User | null | undefined): string => {
    if (!user) return 'Non défini';
    if (typeof user === 'object' && user.name) return user.name;
    if (typeof user === 'string') {
      const found = userList.find((u) => u._id === user);
      return found ? found.name : user;
    }
    return 'Format invalide';
  };

  // FORMATER LA DATE
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  // ÉDITER UN INCIDENT
  const handleEdit = (incident: Incident) => {
    if (!canEditIncident(incident)) {
      alert('Vous n\'avez pas la permission de modifier cet incident.');
      return;
    }
    setSelectedIncident(incident);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // FERMER LE MODAL
  const handleModalClose = (shouldRefresh = false) => {
    setIsModalOpen(false);
    setSelectedIncident(null);
    if (shouldRefresh) {
      setTimeout(() => fetchData(true), 800);
    }
  };

  // INCIDENT CRÉÉ
  const handleIncidentCreated = (newIncident: any) => {
    const incidentToAdd: Incident = {
      _id: newIncident._id || `new-${Date.now()}`,
      title: newIncident.title || newIncident.titre || 'Nouvel incident',
      description: newIncident.description || '',
      equipment: newIncident.equipment || newIncident.equipement || null,
      status: newIncident.status || 'Nouveau',
      priority: newIncident.priority || 'Moyenne',
      reportedBy: currentUser || null,
      createdAt: newIncident.createdAt || new Date().toISOString(),
      updatedAt: newIncident.updatedAt || new Date().toISOString()
    };
    
    setIncidents(prev => [incidentToAdd, ...prev]);
  };

  // FILTRER LES INCIDENTS
  const filteredIncidents = React.useMemo(() => {
    const roleFilteredIncidents = filterIncidentsByRole(incidents);

    return roleFilteredIncidents
      .filter((item) => filterStatus === 'all' || item.status === filterStatus)
      .filter((item) => filterPriority === 'all' || item.priority === filterPriority)
      .filter((item) => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        const title = (item.title || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        const equipmentName = (getEquipmentName(item.equipment) || '').toLowerCase();
        const userName = (getUserName(item.reportedBy) || '').toLowerCase();
        
        return (
          title.includes(search) ||
          description.includes(search) ||
          equipmentName.includes(search) ||
          userName.includes(search)
        );
      })
      .sort((a, b) => {
        const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [incidents, filterStatus, filterPriority, searchTerm, getEquipmentName, getUserName, filterIncidentsByRole]);

  // ICÔNES
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Nouveau': return <AlertCircle className="h-4 w-4" />;
      case 'En cours': return <ClockIcon className="h-4 w-4" />;
      case 'Résolu': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Élevée': return <AlertTriangleIcon className="h-4 w-4" />;
      case 'Moyenne': return <AlertCircle className="h-4 w-4" />;
      case 'Basse': return <ClockIcon className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // BADGE DE RÔLE
  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <ShieldIcon className="h-3 w-3 mr-1" />
          Administrateur
        </span>
      );
    } else if (isTechnicien) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <UserIcon className="h-3 w-3 mr-1" />
          Technicien
        </span>
      );
    } else if (isEmploye) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
          <UserIcon className="h-3 w-3 mr-1" />
          Employé
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
          <UserIcon className="h-3 w-3 mr-1" />
          {userRole}
        </span>
      );
    }
  };

  if (!apiAvailable && !isLoading) {
    return <ApiErrorFallback onRetry={() => fetchData()} />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-6 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h2 className="text-4xl font-black bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                Gestion des incidents
              </h2>
              {getRoleBadge()}
            </div>
            <p className="text-gray-400">
              {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} visible{filteredIncidents.length !== 1 ? 's' : ''}
              {incidents.length > 0 && ` (${incidents.length} au total)`}
              {currentUser && ` • Connecté en tant que ${currentUser.name}`}
            </p>
          </div>

          <div className="flex space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-200 disabled:opacity-50 border border-gray-600"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </button>

            {canAddIncident() && (
              <button
                onClick={() => {
                  setSelectedIncident(null);
                  setModalMode('add');
                  setIsModalOpen(true);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                disabled={!apiAvailable}
              >
                <PlusIcon className="h-5 w-5" />
                <span>Déclarer un incident</span>
              </button>
            )}
          </div>
        </div>

        {/* Information permissions */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-center">
            <ShieldIcon className="h-5 w-5 text-blue-400 mr-3" />
            <div>
              <p className="text-blue-300 font-medium">Permissions actuelles</p>
              <p className="text-blue-400 text-sm">
                {isAdmin && 'Vous avez accès à tous les incidents • Peut modifier, résoudre et supprimer'}
                {isTechnicien && 'Vous avez accès à tous les incidents • Peut modifier et résoudre • Ne peut pas supprimer'}
                {isEmploye && `Vous voyez seulement vos propres incidents • Peut modifier et supprimer vos incidents • Ne peut pas résoudre • ${filteredIncidents.length} incident(s) visible(s) sur ${incidents.length} au total`}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <p className="text-red-300 font-medium">Information</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-blue-400 hover:text-blue-300 underline text-sm"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative w-full lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            <div className="flex items-center space-x-4">
              <FilterIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="Nouveau">Nouveau</option>
                <option value="En cours">En cours</option>
                <option value="Résolu">Résolu</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="all">Toutes priorités</option>
                <option value="Élevée">Élevée</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Basse">Basse</option>
              </select>
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Équipement
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Priorité
                  </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
  {isEmploye ? 'DÉCLARÉ PAR' : 'TRAITÉ PAR'}
</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
            <tbody className="divide-y divide-gray-700/50">
  {filteredIncidents.map((incident) => (
    <tr
      key={incident._id}
      className={`hover:bg-gray-800/30 transition-colors duration-200 ${
        incident.status === 'Résolu' ? 'opacity-70' : ''
      }`}
    >
      {/* Incident */}
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-semibold text-white mb-1 flex items-center">
            <AlertCircle className="h-4 w-4 text-blue-400 mr-2" />
            {incident.title}
          </div>
          <div
            className="text-sm text-gray-300 max-w-xs truncate"
            title={incident.description}
          >
            {incident.description || 'Aucune description'}
          </div>
        </div>
      </td>

      {/* Équipement */}
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-300">
          <PackageIcon className="h-4 w-4 text-gray-400 mr-2" />
          {getEquipmentName(incident.equipment)}
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 text-sm text-gray-300">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
          {formatDate(incident.createdAt)}
        </div>
      </td>

      {/* Statut */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            incident.status === 'Nouveau'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : incident.status === 'En cours'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}
        >
          {getStatusIcon(incident.status)}
          <span className="ml-1">{incident.status}</span>
        </span>
      </td>

      {/* Priorité */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            incident.priority === 'Élevée'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : incident.priority === 'Moyenne'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}
        >
          {getPriorityIcon(incident.priority)}
          <span className="ml-1">{incident.priority}</span>
        </span>
      </td>

      {/* 🔥 COLONNE TRAITÉ PAR : Déclaré par OU Résolu par */}
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-300">
          <UserIcon className="h-4 w-4 text-cyan-400 mr-2" />

          {incident.status === 'Résolu' && incident.resolvedBy ? (
            <>
              <span className="font-medium">
                {getUserName(incident.resolvedBy)}
              </span>
              <span className="ml-2 text-xs font-medium text-green-400">
                (Résolu par)
              </span>

              {/* Affichage du rôle du résolveur */}
              {(() => {
                const resolver =
                  typeof incident.resolvedBy === 'object' && incident.resolvedBy !== null
                    ? incident.resolvedBy
                    : userList.find((u) => u._id === incident.resolvedBy);

                if (!resolver?.role) return null;

                const role = resolver.role.toLowerCase().trim();
                if (role.includes('admin'))
                  return <span className="ml-2 text-xs text-purple-400">(Admin)</span>;
                if (role.includes('tech'))
                  return <span className="ml-2 text-xs text-blue-400">(Technicien)</span>;
                return null;
              })()}
            </>
          ) : (
            <>
              <span className="font-medium">
                {getUserName(incident.reportedBy)}
              </span>
              <span className="ml-2 text-xs font-medium text-yellow-400">
                (Déclaré par)
              </span>

              {/* Affichage du rôle du déclarant */}
              {(() => {
                const reporter =
                  typeof incident.reportedBy === 'object' && incident.reportedBy !== null
                    ? incident.reportedBy
                    : userList.find((u) => u._id === getReportedById(incident.reportedBy));

                if (!reporter?.role) return null;

                const role = reporter.role.toLowerCase().trim();
                if (role.includes('admin'))
                  return <span className="ml-2 text-xs text-purple-400">(Admin)</span>;
                if (role.includes('tech'))
                  return <span className="ml-2 text-xs text-blue-400">(Technicien)</span>;
                if (role.includes('employ'))
                  return <span className="ml-2 text-xs text-green-400">(Employé)</span>;
                return null;
              })()}
            </>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          {/* Modifier */}
          {canEditIncident(incident) && incident.status !== 'Résolu' && (
            <button
              onClick={() => handleEdit(incident)}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-all duration-200"
              title="Modifier"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}

          {/* Résoudre */}
          {canResolveIncident(incident) && incident.status !== 'Résolu' && (
            <button
              onClick={() => handleResolveAndDelete(incident)}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 hover:text-green-300 transition-all duration-200"
              title="Marquer comme résolu"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          )}

          {/* Supprimer (Admin uniquement) */}
          {canDeleteIncident(incident) && isAdmin && (
            <button
              onClick={() => handleDelete(incident)}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200"
              title="Supprimer"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>

          {/* Empty State */}
          {filteredIncidents.length === 0 && (
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {incidents.length === 0
                  ? 'Aucun incident déclaré'
                  : isEmploye 
                    ? 'Aucun incident déclaré par vous'
                    : 'Aucun incident correspondant aux filtres'}
              </h3>
              <p className="text-gray-400 mb-4">
                {incidents.length === 0
                  ? 'Commencez par déclarer votre premier incident.'
                  : isEmploye
                    ? `Il y a ${incidents.length} incident(s) au total dans le système, mais aucun n'a été déclaré par vous.`
                    : 'Aucun incident ne correspond aux critères de recherche et filtres actuels.'}
              </p>
              {incidents.length === 0 && canAddIncident() && (
                <button
                  onClick={() => {
                    setSelectedIncident(null);
                    setModalMode('add');
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-200 transform hover:scale-105 flex items-center mx-auto"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Déclarer un incident
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <IncidentModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onIncidentCreated={handleIncidentCreated}
            incident={
              selectedIncident
                ? {
                    ...selectedIncident,
                    equipment:
                      typeof selectedIncident.equipment === 'string'
                        ? selectedIncident.equipment
                        : selectedIncident.equipment?._id || null
                  }
                : null
            }
            mode={modalMode}
            equipmentList={equipmentList}
            userList={userList}
            userRole={userRole}
            currentUser={currentUser}
            authToken={authToken}
          />
        )}
      </div>
    </div>
  );
};

export default IncidentList;