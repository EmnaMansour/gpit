import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, AlertCircle, CheckCircle, Users, 
  RefreshCw, Shield, Mail, User, Search, Filter, Sparkles,
  Eye, EyeOff, Building
} from 'lucide-react';

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  lastLogin?: string;
  department?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  mode: 'add' | 'edit';
  onSuccess?: () => void;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  linkedData: {
    incidents: number;
    equipements: number;
  };
}

const getApiConfig = () => {
  return {
    baseUrl: 'http://localhost:8000',
    endpoint: '/api/users/all',
    createEndpoint: '/api/users/register',
    updateEndpoint: '/api/users/profile',
    deleteEndpoint: '/api/users',
    authEndpoint: '/api/users/login'
  };
};

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  linkedData 
}) => {
  if (!isOpen) return null;

  const hasIncidents = linkedData.incidents > 0;
  const hasEquipments = linkedData.equipements > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-md border border-red-500/30 shadow-2xl">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">🚫 Suppression impossible</h3>
              <p className="text-sm text-gray-400">Dépendances actives</p>
            </div>
          </div>

          {/* Informations utilisateur */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-700">
            <p className="text-gray-300 mb-3">
              L'utilisateur <strong className="text-white">{user.name}</strong> est lié à :
            </p>
            <div className="space-y-2">
              {hasIncidents && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">🎫 Incidents</span>
                  <span className="text-red-400 font-bold">{linkedData.incidents}</span>
                </div>
              )}
              {hasEquipments && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">💻 Équipements</span>
                  <span className="text-red-400 font-bold">{linkedData.equipements}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message d'erreur */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
            <p className="text-red-300 text-sm font-medium mb-2">
              🚫 Suppression bloquée
            </p>
            <p className="text-red-400 text-xs mb-3">
              Vous devez d'abord supprimer ou désassigner toutes les dépendances avant de pouvoir supprimer cet utilisateur.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
            <p className="text-gray-300 text-sm font-medium mb-2">
              📋 Actions à effectuer :
            </p>
            <ul className="text-gray-400 text-xs space-y-2">
              {hasIncidents && (
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <span>Allez dans <strong className="text-white">"Gestion des incidents"</strong> et supprimez ou réassignez les {linkedData.incidents} incident(s)</span>
                </li>
              )}
              {hasEquipments && (
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <span>Allez dans <strong className="text-white">"Gestion des équipements"</strong> et désassignez ou supprimez les {linkedData.equipements} équipement(s)</span>
                </li>
              )}
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>Revenez ensuite pour supprimer l'utilisateur</span>
              </li>
            </ul>
          </div>

          {/* Bouton Fermer uniquement */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all font-medium"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, mode, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employe',
    password: '',
    confirmPassword: '',
    department: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const suggestedDepartments = [
    'Direction',
    'Ressources Humaines',
    'Support IT',
    'Infrastructure',
    'Développement',
    'Réseau',
    'Sécurité',
    'Commercial',
    'Marketing',
    'Finance',
    'Production'
  ];

  useEffect(() => {
    if (!isOpen) {
      setFormData({ 
        name: '', 
        email: '', 
        role: 'employe', 
        password: '', 
        confirmPassword: '',
        department: '' 
      });
      setErrorMessage('');
      setSuccessMessage('');
    } else if (user && mode === 'edit') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'employe',
        password: '',
        confirmPassword: '',
        department: user.department || ''
      });
    }
  }, [isOpen, user, mode]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Le nom et l\'email sont requis');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Format d\'email invalide');
      return;
    }

    if (mode === 'add' && (!formData.password || formData.password.length < 6)) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (mode === 'add' && formData.password !== formData.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    if (mode === 'edit' && formData.password && formData.password !== formData.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const apiConfig = getApiConfig();
      
      const requestData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        department: formData.department.trim() || ''
      };

      if (formData.password && formData.password.trim()) {
        requestData.password = formData.password;
        if (mode === 'add') {
          requestData.confirmPassword = formData.confirmPassword;
        }
      }

      let url = `${apiConfig.baseUrl}`;
      let method: 'POST' | 'PUT' = 'POST';

      if (mode === 'edit') {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error('ID utilisateur manquant');
        url += `${apiConfig.updateEndpoint}/${userId}`;
        method = 'PUT';
      } else {
        url += apiConfig.createEndpoint;
        method = 'POST';
      }

      const token = localStorage.getItem('authToken')?.replace(/"/g, '');
      const headers: any = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('📤 Envoi des données:', { url, method, data: requestData });

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Route API non trouvée. Vérifiez que le backend est configuré correctement.');
        }
        
        let errorMsg = `Erreur HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
          console.log('❌ Erreur détaillée:', errorData);
        } catch {
          errorMsg = `${errorMsg}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('✅ Réponse serveur:', result);

      setSuccessMessage(mode === 'add' ? 'Utilisateur créé avec succès!' : 'Utilisateur modifié avec succès!');

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setErrorMessage(error.message || 'Erreur lors de l\'envoi des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleDepartmentSelect = (department: string) => {
    setFormData(prev => ({ ...prev, department }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-md border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === 'add' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
                </h2>
                <p className="text-sm text-gray-400">
                  {mode === 'add' ? 'Créez un nouveau compte utilisateur' : 'Modifiez les informations de l\'utilisateur'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-300 text-sm">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entrez le nom complet"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="exemple@entreprise.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rôle *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  disabled={isLoading}
                >
                  <option value="employe">Employé</option>
                  <option value="technicien">Technicien</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Département
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Support IT, RH, Direction..."
                  list="departments"
                  disabled={isLoading}
                />
                <datalist id="departments">
                  {suggestedDepartments.map((dept, index) => (
                    <option key={index} value={dept} />
                  ))}
                </datalist>
              </div>
              
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-2">Suggestions :</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedDepartments.slice(0, 4).map((dept, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDepartmentSelect(dept)}
                      className="text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white px-2 py-1 rounded border border-gray-600 transition-colors"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {mode === 'add' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-4 pr-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minimum 6 caractères"
                      disabled={isLoading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-4 pr-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirmez le mot de passe"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'edit' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nouveau mot de passe (optionnel)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-4 pr-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Laissez vide pour ne pas changer"
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Laissez vide pour conserver le mot de passe actuel
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button 
                type="button"
                onClick={onClose} 
                disabled={isLoading} 
                className="px-6 py-3 border border-gray-600 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Ajouter' : 'Enregistrer'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user?: User;
    linkedData?: { incidents: number; equipements: number };
  }>({ isOpen: false });

  const normalizeRoleForDisplay = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      'employee': 'Employé',
      'employe': 'Employé',
      'employé': 'Employé',
      'technicien': 'Technicien',
      'technician': 'Technicien',
      'admin': 'Administrateur',
      'administrateur': 'Administrateur',
    };
    
    return roleMap[role?.toLowerCase()] || role;
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const apiConfig = getApiConfig();
      const token = localStorage.getItem('authToken')?.replace(/"/g, '');
      const headers: any = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('📥 Chargement depuis:', `${apiConfig.baseUrl}${apiConfig.endpoint}`);

      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoint}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Données reçues:', data);

      let usersData: User[] = [];
      
      if (Array.isArray(data)) {
        usersData = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.users)) {
          usersData = data.users;
        } else if (Array.isArray(data.data)) {
          usersData = data.data;
        } else if (data.success && Array.isArray(data.users)) {
          usersData = data.users;
        }
      }

      console.log('👥 Utilisateurs bruts:', usersData);
      setUsers(usersData);
      
    } catch (error: any) {
      console.error('❌ Erreur loadUsers:', error);
      setError(error.message || 'Erreur de chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openModal = (user?: User) => {
    if (user) {
      setModalMode('edit');
      setSelectedUser(user);
    } else {
      setModalMode('add');
      setSelectedUser(undefined);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleSuccess = () => {
    loadUsers();
  };

const handleDelete = async (user: User) => {
  // Première confirmation
  if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`)) {
    return;
  }

  try {
    const apiConfig = getApiConfig();
    const userId = user._id || user.id;
    const token = localStorage.getItem('authToken')?.replace(/"/g, '');
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${apiConfig.baseUrl}${apiConfig.deleteEndpoint}/${userId}`;

    console.log('🗑️ Tentative de suppression:', { url });

    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });

    const responseData = await response.json();

    if (response.ok) {
      // Suppression réussie
      alert(responseData.message || 'Utilisateur supprimé avec succès');
      await loadUsers();
      
    } else if (response.status === 400 && responseData.linkedData) {
      // Utilisateur a des dépendances - Afficher le modal de blocage
      setDeleteModal({
        isOpen: true,
        user,
        linkedData: responseData.linkedData
      });
      
    } else {
      // Autre erreur
      throw new Error(responseData.error || `Erreur HTTP ${response.status}`);
    }
    
  } catch (err: any) {
    console.error('❌ Erreur handleDelete:', err);
    alert(err.message || "Erreur lors de la suppression");
  }
};

  const departments = Array.from(new Set(users
    .map(user => user.department)
    .filter(dept => dept && dept.trim() !== '')
  )).sort();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const userDisplayRole = normalizeRoleForDisplay(user.role);
    const matchesRole = filterRole === 'all' || userDisplayRole === filterRole;
    
    const matchesDepartment = filterDepartment === 'all' || 
                             (filterDepartment === 'none' && !user.department) ||
                             user.department === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getRoleColor = (role: string) => {
    const displayRole = normalizeRoleForDisplay(role);
    switch (displayRole) {
      case 'Administrateur': return 'from-purple-500 to-purple-600';
      case 'Technicien': return 'from-blue-500 to-blue-600';
      case 'Employé': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    const displayRole = normalizeRoleForDisplay(role);
    switch (displayRole) {
      case 'Administrateur': return <Shield className="h-4 w-4" />;
      case 'Technicien': return <User className="h-4 w-4" />;
      case 'Employé': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const roleStats = {
    total: users.length,
    admin: users.filter(user => normalizeRoleForDisplay(user.role) === 'Administrateur').length,
    technicien: users.filter(user => normalizeRoleForDisplay(user.role) === 'Technicien').length,
    employe: users.filter(user => normalizeRoleForDisplay(user.role) === 'Employé').length,
  };

  const departmentStats = {
    withDepartment: users.filter(user => user.department && user.department.trim() !== '').length,
    withoutDepartment: users.filter(user => !user.department || user.department.trim() === '').length
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent mb-2">
              Gestion des utilisateurs
            </h2>
            <div className="flex items-center space-x-4">
              <p className="text-gray-400">
                {filteredUsers.length} {filteredUsers.length <= 1 ? 'utilisateur' : 'utilisateurs'}
                {users.length > 0 && ` sur ${users.length} au total`}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-200 disabled:opacity-50 border border-gray-600"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Actualisation...' : 'Actualiser'}</span>
            </button>
            
            <button
              onClick={() => openModal()}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <p className="text-red-300 font-medium">Erreur de chargement</p>
              <p className="text-red-400 text-sm">{error}</p>
              <button 
                onClick={loadUsers}
                className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="text-2xl font-bold text-white">{roleStats.total}</div>
              <div className="text-sm text-gray-400">Total utilisateurs</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="text-2xl font-bold text-purple-400">{roleStats.admin}</div>
              <div className="text-sm text-gray-400">Administrateurs</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="text-2xl font-bold text-blue-400">{roleStats.technicien}</div>
              <div className="text-sm text-gray-400">Techniciens</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="text-2xl font-bold text-green-400">{roleStats.employe}</div>
              <div className="text-sm text-gray-400">Employés</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="text-2xl font-bold text-orange-400">{departmentStats.withDepartment}</div>
              <div className="text-sm text-gray-400">Avec département</div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="all">Tous les rôles</option>
                <option value="Employé">Employé</option>
                <option value="Technicien">Technicien</option>
                <option value="Administrateur">Administrateur</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="all">Tous les départements</option>
                <option value="none">Non spécifié</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/30 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement des utilisateurs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Département</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Dernière connexion</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id || user.id || index} className="hover:bg-gray-800/30 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                              <span className="text-sm font-semibold text-blue-400">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-white">{user.name}</div>
                            <div className="text-xs text-gray-400">
                              ID: {user._id || user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getRoleColor(user.role)} text-white border border-gray-600`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{normalizeRoleForDisplay(user.role)}</span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.department || '-'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(user.lastLogin)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => openModal(user)} 
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-all duration-200" 
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(user)} 
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200" 
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredUsers.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">
                          {users.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur ne correspond aux critères'}
                        </p>
                        {users.length === 0 && (
                          <button
                            onClick={() => openModal()}
                            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
                          >
                            Ajouter le premier utilisateur
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        <UserModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          user={selectedUser} 
          mode={modalMode} 
          onSuccess={handleSuccess} 
        />

       {deleteModal.user && (
  <DeleteConfirmModal
    isOpen={deleteModal.isOpen}
    onClose={() => setDeleteModal({ isOpen: false })}
    user={deleteModal.user}
    linkedData={deleteModal.linkedData!}
  />
)}
      </div>
    </div>
  );
};

export default UserManagement;