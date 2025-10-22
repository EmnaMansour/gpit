import React, { useEffect, useState, useRef } from 'react';
import { XIcon, AlertTriangle, FileText, User, Cpu, Calendar, Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface User {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

interface Equipment {
  _id: string;
  name: string;
  nom?: string;
  type?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
}

interface IncidentFormData {
  _id?: string;
  title: string;
  description: string;
  equipment: string;
  priority: 'Basse' | 'Moyenne' | 'Élevée';
  status?: 'Nouveau' | 'En cours' | 'Résolu';
  reportedBy?: string;
  assignedTo?: string;
  resolutionNotes?: string;
}

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: any;
  mode: 'add' | 'edit';
  setIncidents?: React.Dispatch<React.SetStateAction<any[]>>;
  equipmentList?: Equipment[];
  userList?: User[];
  userRole: string;
  currentUser?: User | null;
  authToken?: string;
  onSuccess?: () => void;
  onIncidentUpdate?: (incident: any, action: 'create' | 'update') => void;
}

// Schéma de validation
const incidentSchema = yup.object().shape({
  title: yup
    .string()
    .required('Le titre est obligatoire')
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères')
    .trim(),
  description: yup
    .string()
    .required('La description est obligatoire')
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne doit pas dépasser 2000 caractères')
    .trim(),
  equipment: yup
    .string()
    .required("L'équipement est obligatoire")
    .test('is-valid-id', 'Veuillez sélectionner un équipement valide', value => {
      return !!value && value !== '';
    }),
  priority: yup
    .string()
    .oneOf(['Basse', 'Moyenne', 'Élevée'], 'Priorité invalide')
    .required('La priorité est requise'),
  status: yup.string().optional(),
  reportedBy: yup.string().optional(),
  assignedTo: yup.string().nullable().optional(),
  resolutionNotes: yup.string().optional(),
});

const IncidentModal: React.FC<IncidentModalProps> = ({
  isOpen,
  onClose,
  incident = null,
  mode,
  setIncidents,
  equipmentList: propEquipmentList = [],
  userList: propUserList = [],
  userRole,
  currentUser = null,
  authToken,
  onSuccess,
  onIncidentUpdate
}) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formInitialized, setFormInitialized] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Réf pour stocker les callbacks de manière stable
  const callbacksRef = useRef({
    onIncidentUpdate,
    setIncidents,
    onSuccess
  });

  // Mettre à jour la ref quand les props changent
  useEffect(() => {
    callbacksRef.current = {
      onIncidentUpdate,
      setIncidents,
      onSuccess
    };
  }, [onIncidentUpdate, setIncidents, onSuccess]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
    getValues,
  } = useForm<IncidentFormData>({
    resolver: yupResolver(incidentSchema),
    defaultValues: {
      title: '',
      description: '',
      equipment: '',
      priority: 'Moyenne',
      status: 'Nouveau',
      reportedBy: '',
      assignedTo: '',
      resolutionNotes: ''
    },
  });

  // Surveiller les changements
  const currentStatus = watch('status');
  const currentPriority = watch('priority');
  const currentEquipment = watch('equipment');

  // Effet pour le curseur animé
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen]);

  // Vérifier l'authentification
  const checkAuthentication = (): boolean => {
    const token = authToken || localStorage.getItem('token');
    if (!token) {
      setApiError('Session expirée. Veuillez vous reconnecter.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return false;
    }
    return true;
  };

  // Gestion spécifique des erreurs 401
  const handleAuthError = (error: any): boolean => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      setPermissionError('Permissions insuffisantes pour accéder aux équipements. Contactez votre administrateur.');
      return true;
    }
    return false;
  };

  // Normaliser les données équipements
  const normalizeEquipmentData = (data: any): Equipment[] => {
    if (!data) return [];
    
    let items: any[] = [];
    
    if (Array.isArray(data)) {
      items = data;
    } else if (data.data && Array.isArray(data.data)) {
      items = data.data;
    } else if (data.equipments && Array.isArray(data.equipments)) {
      items = data.equipments;
    } else if (data.equipment && Array.isArray(data.equipment)) {
      items = data.equipment;
    } else if (data.equipements && Array.isArray(data.equipements)) {
      items = data.equipements;
    }
    
    if (!Array.isArray(items)) return [];
    
    return items
      .map((item: any) => ({
        _id: item._id || item.id || '',
        name: item.name || item.nom || item.title || 'Équipement sans nom',
        nom: item.nom || item.name,
        type: item.type || item.categorie || item.category || '',
        model: item.model || item.modele || '',
        serialNumber: item.serialNumber || item.numeroSerie || item.serial || '',
        location: item.location || item.localisation || item.place || ''
      }))
      .filter((item: Equipment) => item._id && item.name);
  };

  // Fonction sécurisée pour mettre à jour les incidents
  const safeUpdateIncidents = (updatedIncident: any, action: 'create' | 'update') => {
    try {
      console.log('[MODAL] Mise à jour incident:', { action, incident: updatedIncident });
      
      const { onIncidentUpdate, setIncidents, onSuccess } = callbacksRef.current;

      // Méthode 1: Utiliser le callback si fourni (préféré)
      if (onIncidentUpdate && typeof onIncidentUpdate === 'function') {
        console.log('[MODAL] Utilisation de onIncidentUpdate callback');
        onIncidentUpdate(updatedIncident, action);
        return;
      }
      
      // Méthode 2: Utiliser setIncidents si disponible
      if (setIncidents && typeof setIncidents === 'function') {
        console.log('[MODAL] Utilisation de setIncidents');
        if (action === 'create') {
          setIncidents(prev => {
            const newIncidents = [updatedIncident, ...prev];
            console.log('[MODAL] Incident créé, nouvelle liste:', newIncidents.length);
            return newIncidents;
          });
        } else {
          setIncidents(prev => {
            const updatedIncidents = prev.map(item => 
              item._id === updatedIncident._id ? updatedIncident : item
            );
            console.log('[MODAL] Incident mis à jour, nouvelle liste:', updatedIncidents.length);
            return updatedIncidents;
          });
        }
        return;
      }
      
      // Méthode 3: Fallback - utiliser onSuccess
      console.log('[MODAL] Aucune méthode de mise à jour directe, utilisation de onSuccess');
      if (onSuccess && typeof onSuccess === 'function') {
        console.log('[MODAL] Appel de onSuccess');
        onSuccess();
      } else {
        console.log('[MODAL] Aucun callback disponible, les données seront rafraîchies au prochain rechargement');
      }
      
    } catch (error) {
      console.error('[MODAL] Erreur lors de la mise à jour des incidents:', error);
      // En cas d'erreur, on utilise onSuccess comme fallback
      const { onSuccess } = callbacksRef.current;
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    }
  };

  // Charger les équipements depuis l'API
  const loadEquipments = async (): Promise<void> => {
    if (!checkAuthentication()) return;
    
    try {
      const config: any = {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      if (authToken) {
        const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
        config.headers.Authorization = token;
      }

      console.log('[MODAL] Tentative de chargement des équipements...');
      const response = await axios.get(`${API_BASE_URL}/api/equipements`, config);
      const equipments = normalizeEquipmentData(response.data);
      setEquipmentList(equipments);
      setPermissionError(null);
      
      console.log('[MODAL] Équipements chargés:', equipments.length);
      
      if (equipments.length === 0) {
        console.warn('[MODAL] Aucun équipement trouvé');
      }
    } catch (error: any) {
      console.error('[MODAL] Erreur chargement équipements:', error);
      
      if (handleAuthError(error)) {
        console.warn('[MODAL] Employé n\'a pas accès aux équipements - utilisation des props');
        if (propEquipmentList && propEquipmentList.length > 0) {
          setEquipmentList(propEquipmentList);
          setPermissionError(null);
        }
        return;
      }
      
      if (error.response?.status === 401) {
        setApiError('Session expirée. Redirection...');
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        console.warn('[MODAL] Erreur non critique chargement équipements');
        if (propEquipmentList && propEquipmentList.length > 0) {
          setEquipmentList(propEquipmentList);
        }
      }
    }
  };

  // Charger toutes les données
  const loadData = async (): Promise<void> => {
    if (!isOpen) return;
    
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);
    setPermissionError(null);
    
    try {
      if (propEquipmentList && propEquipmentList.length > 0) {
        console.log('[MODAL] Utilisation des équipements des props:', propEquipmentList.length);
        setEquipmentList(propEquipmentList);
      } else {
        await loadEquipments();
      }
    } catch (error) {
      console.error('[MODAL] Erreur générale lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // DEBUG: Fonction pour afficher les données de l'incident
  const debugIncidentData = (incident: any) => {
    console.log('=== DEBUG INCIDENT DATA ===');
    console.log('Incident complet:', incident);
    console.log('ID:', incident?._id);
    console.log('Titre:', incident?.title);
    console.log('Description:', incident?.description);
    console.log('Équipement:', incident?.equipment);
    console.log('Type équipement:', typeof incident?.equipment);
    if (incident?.equipment && typeof incident.equipment === 'object') {
      console.log('Équipement ID:', incident.equipment._id);
      console.log('Équipement Nom:', incident.equipment.name);
    }
    console.log('Priorité:', incident?.priority);
    console.log('Statut:', incident?.status);
    console.log('ReportedBy:', incident?.reportedBy);
    console.log('Type reportedBy:', typeof incident?.reportedBy);
    console.log('==========================');
  };

  // Vérifier si l'incident a changé
  const hasIncidentChanged = (newIncident: any): boolean => {
    if (!newIncident) return false;
    if (!currentIncidentId) return true;
    return newIncident._id !== currentIncidentId;
  };

  // Initialiser le formulaire pour l'édition
  const initializeEditForm = async (incidentData: any) => {
    console.log('[MODAL] Initialisation édition pour incident:', incidentData._id);
    
    if (currentIncidentId === incidentData._id && formInitialized) {
      console.log('[MODAL] Formulaire déjà initialisé pour cet incident');
      return;
    }

    if (equipmentList.length === 0 && propEquipmentList.length === 0) {
      console.log('[MODAL] En attente des équipements...');
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    let equipmentId = '';
    if (incidentData.equipment) {
      if (typeof incidentData.equipment === 'object' && incidentData.equipment._id) {
        equipmentId = incidentData.equipment._id;
      } else if (typeof incidentData.equipment === 'string') {
        equipmentId = incidentData.equipment;
      }
    }

    console.log('[MODAL] Equipment ID extrait:', equipmentId);

    const formData: IncidentFormData = {
      _id: incidentData._id,
      title: incidentData.title || '',
      description: incidentData.description || '',
      equipment: equipmentId,
      priority: incidentData.priority || 'Moyenne',
      status: incidentData.status || 'Nouveau',
      reportedBy: currentUser?._id || '',
      resolutionNotes: incidentData.resolutionNotes || ''
    };
    
    console.log('[MODAL] Données formulaire édition:', formData);
    
    reset(formData, {
      keepDefaultValues: false,
      keepValues: false,
      keepDirty: false,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false
    });
    
    setCurrentIncidentId(incidentData._id);
    
    setTimeout(() => {
      const values = getValues();
      console.log('[MODAL] Valeurs après reset:', values);
      console.log('[MODAL] Équipement sélectionné:', values.equipment);
      console.log('[MODAL] Statut sélectionné:', values.status);
      setFormInitialized(true);
    }, 200);
  };

  // Initialiser le formulaire pour l'ajout
  const initializeAddForm = () => {
    console.log('[MODAL] Initialisation ajout');
    
    reset({
      title: '',
      description: '',
      equipment: '',
      priority: 'Moyenne',
      status: 'Nouveau',
      reportedBy: currentUser?._id || '',
      resolutionNotes: ''
    }, {
      keepDefaultValues: false,
      keepValues: false,
      keepDirty: false,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false
    });
    
    setCurrentIncidentId(null);
    setFormInitialized(true);
    console.log('[MODAL] Formulaire réinitialisé avec les données par défaut');
  };

  // Soumission du formulaire sécurisée
  const onSubmit = async (data: IncidentFormData) => {
    if (!checkAuthentication()) return;
    
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);
    
    try {
      console.log('[MODAL] Données du formulaire:', data);
      
      const config: any = {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      };

      if (authToken) {
        const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
        config.headers.Authorization = token;
      }

      let payload: any = {
        title: data.title.trim(),
        description: data.description.trim(),
        equipment: data.equipment,
        priority: data.priority,
      };

      console.log('[MODAL] Mode:', mode);
      console.log('[MODAL] Payload de base:', payload);

      let response;

      if (mode === 'add') {
        payload.status = 'Nouveau';
        if (currentUser?._id) {
          payload.reportedBy = currentUser._id;
        }
        
        console.log('[MODAL] Payload final création:', payload);
        
        response = await axios.post(`${API_BASE_URL}/api/incidents`, payload, config);
        console.log('[MODAL] Réponse création:', response.data);
        
        safeUpdateIncidents(response.data, 'create');
        setSuccessMessage('Incident créé avec succès!');
        
      } else if (incident?._id) {
        console.log('[MODAL] Édition de l\'incident ID:', incident._id);
        
        const normalizedRole = userRole?.toLowerCase() || '';
        const canEditStatus = normalizedRole.includes('admin') || normalizedRole.includes('technicien');
        
        if (canEditStatus && data.status) {
          payload.status = data.status;
          console.log('[MODAL] Statut inclus:', data.status);
        } else {
          payload.status = incident.status || 'Nouveau';
        }
        
        if (data.status === 'Résolu' && data.resolutionNotes) {
          payload.resolutionNotes = data.resolutionNotes;
          console.log('[MODAL] Notes de résolution incluses');
        }
        
        console.log('[MODAL] Payload final édition:', payload);
        console.log('[MODAL] URL:', `${API_BASE_URL}/api/incidents/${incident._id}`);
        
        response = await axios.put(`${API_BASE_URL}/api/incidents/${incident._id}`, payload, config);
        console.log('[MODAL] Réponse édition:', response.data);
        
        safeUpdateIncidents(response.data, 'update');
        setSuccessMessage('Incident modifié avec succès!');
      } else {
        throw new Error('ID d\'incident manquant pour l\'édition');
      }

      // Gestion de la fermeture après succès
      setTimeout(() => {
        onClose();
        // Appeler onSuccess après fermeture si disponible
        const { onSuccess } = callbacksRef.current;
        if (onSuccess && typeof onSuccess === 'function') {
          setTimeout(() => onSuccess(), 100);
        }
      }, 1500);
      
    } catch (error: any) {
      console.error('[MODAL] Erreur détaillée:', error);
      
      if (error.response?.data) {
        console.error('[MODAL] Données erreur:', error.response.data);
        
        if (error.response.data.details) {
          setApiError(`Erreur de validation: ${error.response.data.details}`);
        } else if (error.response.data.error) {
          setApiError(`Erreur: ${error.response.data.error}`);
        } else if (error.response.data.message) {
          setApiError(`Erreur: ${error.response.data.message}`);
        } else {
          setApiError('Erreur lors de la sauvegarde');
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setApiError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      } else if (error.message) {
        setApiError(`Erreur: ${error.message}`);
      } else {
        setApiError('Erreur inconnue lors de la sauvegarde');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialisation et reset du formulaire
  useEffect(() => {
    if (isOpen) {
      console.log('[MODAL] Modal ouvert - mode:', mode, 'incident:', incident?._id);
      
      setFormInitialized(false);
      setApiError(null);
      setSuccessMessage(null);
      setPermissionError(null);
      
      loadData();
      
      if (incident && mode === 'edit') {
        debugIncidentData(incident);
        
        if (hasIncidentChanged(incident)) {
          console.log('[MODAL] Nouvel incident détecté, réinitialisation...');
          initializeEditForm(incident);
        } else {
          console.log('[MODAL] Même incident, pas de réinitialisation nécessaire');
          setFormInitialized(true);
        }
      } else {
        initializeAddForm();
      }
    } else {
      console.log('[MODAL] Modal fermé - réinitialisation complète');
      setFormInitialized(false);
      setCurrentIncidentId(null);
      setPermissionError(null);
    }
  }, [isOpen, incident, mode]);

  useEffect(() => {
    if (isOpen && incident && mode === 'edit' && equipmentList.length > 0 && !formInitialized) {
      console.log('[MODAL] Réinitialisation avec équipements chargés');
      initializeEditForm(incident);
    }
  }, [equipmentList, isOpen, incident, mode, formInitialized]);

  // Gérer la fermeture de la modal
  const handleClose = () => {
    if (isSubmitting) return;
    
    if (isDirty && !successMessage) {
      const confirmClose = window.confirm(
        'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?'
      );
      if (!confirmClose) return;
    }
    
    onClose();
  };

  if (!isOpen) return null;

  // Permissions
  const normalizedRole = userRole?.toLowerCase() || '';
  const canEditStatus = mode === 'edit' && (normalizedRole.includes('admin') || normalizedRole.includes('technicien'));
  const canEditAllFields = normalizedRole.includes('admin') || normalizedRole.includes('technicien');

  // Couleurs pour les priorités
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Basse': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'Moyenne': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'Élevée': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  // Couleurs pour les statuts
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nouveau': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'En cours': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'Résolu': return 'text-green-400 border-green-500/30 bg-green-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20">
      {/* Curseur animé */}
      <div 
        className="fixed w-6 h-6 rounded-full bg-blue-500/20 pointer-events-none z-50 transition-transform duration-100 ease-out hidden md:block"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}
      />

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 p-6 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {mode === 'add' ? 'Déclarer un incident' : 'Modifier l\'incident'}
              </h2>
              <p className="text-sm text-gray-400">
                {mode === 'add' ? 'Remplissez les détails du nouvel incident' : `Modification de l'incident ${incident?._id ? `#${incident._id.substring(0, 8)}` : ''}`}
                {mode === 'edit' && formInitialized && ' ✓ Formulaire chargé'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Messages d'état */}
        <div className="px-6 pt-6 space-y-4">
          {apiError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Erreur:</span>
              </div>
              <div className="text-sm text-red-300 mt-1">{apiError}</div>
            </div>
          )}

          {permissionError && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-center space-x-2 text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Avertissement:</span>
              </div>
              <div className="text-sm text-yellow-300 mt-1">{permissionError}</div>
              <div className="text-xs text-yellow-400 mt-2">
                {equipmentList.length > 0 
                  ? `Utilisation des ${equipmentList.length} équipements disponibles.` 
                  : 'Aucun équipement disponible pour sélection.'}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center space-x-2 text-green-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Succès:</span>
              </div>
              <div className="text-sm text-green-300 mt-1">{successMessage}</div>
            </div>
          )}

          {isLoading && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center space-x-2 text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Chargement des données...</span>
              </div>
            </div>
          )}

          {currentUser && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center space-x-2 text-blue-400">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  {mode === 'add' ? 'Rapporté par:' : 'Modifié par:'} <strong className="text-white">{currentUser.name}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Informations principales */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Informations de l'incident</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titre de l'incident *
                  </label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          {...field}
                          type="text"
                          className={`w-full bg-gray-700/50 border ${
                            errors.title ? 'border-red-500' : 'border-gray-600'
                          } rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                          disabled={isSubmitting}
                          placeholder="Décrivez brièvement l'incident..."
                        />
                      </div>
                    )}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs mt-2 flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{errors.title.message}</span>
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description détaillée *
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        className={`w-full bg-gray-700/50 border ${
                          errors.description ? 'border-red-500' : 'border-gray-600'
                        } rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none`}
                        disabled={isSubmitting}
                        placeholder="Décrivez en détail le problème rencontré, les étapes pour le reproduire, l'impact sur votre travail, etc."
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-xs mt-2 flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{errors.description.message}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Équipement et priorité */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Équipement */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Équipement concerné *</h3>
                  {mode === 'edit' && currentEquipment && (
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                      ✓ Chargé
                    </span>
                  )}
                </div>
                
                <Controller
                  name="equipment"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <select
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        className={`w-full bg-gray-700/50 border ${
                          errors.equipment ? 'border-red-500' : 'border-gray-600'
                        } rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer`}
                        disabled={isSubmitting || (equipmentList.length === 0 && !permissionError)}
                      >
                        <option value="" className="bg-gray-800">
                          {equipmentList.length === 0 
                            ? (permissionError ? 'Aucun équipement accessible' : 'Chargement des équipements...') 
                            : 'Sélectionner un équipement'}
                        </option>
                        {equipmentList.map(equipment => (
                          <option 
                            key={`equipment-${equipment._id}`} 
                            value={equipment._id} 
                            className="bg-gray-800"
                          >
                            {equipment.name} {equipment.type ? `(${equipment.type})` : ''}
                          </option>
                        ))}
                      </select>
                      {errors.equipment && (
                        <p className="text-red-400 text-xs mt-2 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{errors.equipment.message}</span>
                        </p>
                      )}
                      {equipmentList.length === 0 && !isLoading && permissionError && (
                        <p className="text-yellow-400 text-xs mt-2 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Contactez l'administrateur pour accéder aux équipements.</span>
                        </p>
                      )}
                      {mode === 'edit' && currentEquipment && (
                        <p className="text-green-400 text-xs mt-2">
                          ✓ Équipement sélectionné: {equipmentList.find(eq => eq._id === currentEquipment)?.name}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Priorité */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Priorité *</h3>
                </div>
                
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      {(['Basse', 'Moyenne', 'Élevée'] as const).map((priority) => (
                        <label 
                          key={`priority-${priority}`}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer group ${
                            field.value === priority 
                              ? getPriorityColor(priority) + ' border-opacity-100 scale-105' 
                              : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            {...field}
                            value={priority}
                            checked={field.value === priority}
                            onChange={() => field.onChange(priority)}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{priority}</span>
                            {field.value === priority && (
                              <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.priority && (
                  <p className="text-red-400 text-xs mt-2 flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{errors.priority.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Statut (modification seulement) */}
            {mode === 'edit' && canEditStatus && (
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Statut de l'incident</h3>
                </div>
                
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(['Nouveau', 'En cours', 'Résolu'] as const).map((status) => (
                        <label 
                          key={`status-${status}`}
                          className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer text-center font-medium ${
                            field.value === status 
                              ? getStatusColor(status) + ' border-opacity-100 scale-105' 
                              : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            {...field}
                            value={status}
                            checked={field.value === status}
                            onChange={() => field.onChange(status)}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>
            )}

            {/* Notes de résolution */}
            {mode === 'edit' && canEditAllFields && currentStatus === 'Résolu' && (
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Notes de résolution</h3>
                </div>
                
                <Controller
                  name="resolutionNotes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      disabled={isSubmitting}
                      placeholder="Décrivez la solution apportée pour résoudre cet incident, les étapes suivies, les pièces changées, etc."
                    />
                  )}
                />
                <p className="text-gray-400 text-xs mt-2">
                  Ces notes seront visibles par tous les utilisateurs ayant accès à cet incident.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 border-t border-gray-700 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-600 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50 order-2 sm:order-1"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-orange-500 hover:to-orange-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 order-1 sm:order-2"
              disabled={isSubmitting || equipmentList.length === 0 || (mode === 'edit' && !formInitialized)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{mode === 'add' ? 'Déclarer l\'incident' : 'Enregistrer les modifications'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentModal;