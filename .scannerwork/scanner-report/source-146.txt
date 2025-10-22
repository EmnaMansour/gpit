import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'employee' | 'technicien' | 'admin'; // ← CORRIGÉ pour correspondre au backend
  password?: string;
  confirmPassword?: string;
  department?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  mode: 'add' | 'edit';
  onSuccess?: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, mode, onSuccess }) => {
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    role: 'employee', // ← CORRIGÉ valeur par défaut
    password: '',
    confirmPassword: '',
    department: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isOpen) {
      // Réinitialiser le formulaire quand le modal se ferme
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        password: '',
        confirmPassword: '',
        department: ''
      });
      setErrorMessage('');
    } else if (user && mode === 'edit') {
      // Pré-remplir le formulaire en mode édition
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'employee',
        password: '',
        confirmPassword: '',
        department: user.department || ''
      });
      setErrorMessage('');
    }
  }, [isOpen, user, mode]);

  // Fonction pour obtenir le token d'authentification
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    return token ? token.replace(/"/g, '') : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!formData.name.trim()) {
      setErrorMessage('Le nom est requis');
      return;
    }
    
    if (!formData.email.trim()) {
      setErrorMessage('L\'email est requis');
      return;
    }
    
    // Validation format email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Format d\'email invalide');
      return;
    }
    
    // Validation mot de passe pour ajout
    if (mode === 'add' && !formData.password) {
      setErrorMessage('Le mot de passe est requis pour un nouvel utilisateur');
      return;
    }
    
    // Validation longueur mot de passe (6 caractères minimum comme dans le backend)
    if (formData.password && formData.password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    // Validation correspondance mots de passe pour ajout
    if (mode === 'add' && formData.password !== formData.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    // Validation correspondance mots de passe pour édition
    if (mode === 'edit' && formData.password && formData.password !== formData.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    // Préparation des données pour le backend
    const requestData: any = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role, // ← Déjà en minuscules
      department: formData.department?.trim() || ''
    };

    // Ajouter le mot de passe seulement si fourni
    if (formData.password && formData.password.trim()) {
      requestData.password = formData.password;
      // Pour l'ajout, ajouter aussi confirmPassword
      if (mode === 'add') {
        requestData.confirmPassword = formData.confirmPassword;
      }
    }

    console.log('📤 Données envoyées:', requestData);

    setIsLoading(true);
    setErrorMessage('');

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      let response;
      let url;
      
      if (mode === 'add') {
        url = `${API_BASE_URL}/api/users`;
        console.log('➕ Ajout utilisateur:', url);
        
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestData),
        });
      } else if (mode === 'edit' && user?._id) {
        url = `${API_BASE_URL}/api/users/${user._id}`;
        console.log('✏️ Modification utilisateur:', url);
        
        response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(requestData),
        });
      } else {
        throw new Error('ID utilisateur manquant pour la modification');
      }

      console.log('📨 Statut réponse:', response.status);

      if (!response.ok) {
        let errorMsg = 'Erreur lors de l\'envoi';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
          console.log('❌ Erreur détaillée:', errorData);
        } catch (e) {
          errorMsg = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const responseData = await response.json();
      console.log('✅ Succès:', responseData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('❌ Erreur lors de la soumission:', error);
      setErrorMessage(error.message || 'Erreur lors de l\'envoi des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Fonction pour afficher le rôle de manière lisible
  const getDisplayRole = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'employee': 'Employé',
      'technicien': 'Technicien',
      'admin': 'Administrateur'
    };
    return roleMap[role] || role;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* En-tête du modal */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === 'add' ? 'Ajouter un utilisateur' : "Modifier l'utilisateur"}
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le nom complet"
                required
                disabled={isLoading}
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="exemple@entreprise.com"
                required
                disabled={isLoading}
              />
            </div>
            
            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="employee">Employé</option>
                <option value="technicien">Technicien</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            {/* Département */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Département (optionnel)"
                disabled={isLoading}
              />
            </div>
            
            {/* Mots de passe pour ajout */}
            {mode === 'add' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mot de passe (min. 6 caractères)"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirmez le mot de passe"
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
            
            {/* Mots de passe pour édition */}
            {mode === 'edit' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe (optionnel)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Laisser vide pour ne pas changer"
                    minLength={6}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide pour conserver le mot de passe actuel
                  </p>
                </div>
                {formData.password && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirmez le nouveau mot de passe"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </>
            )}

            {/* Message d'erreur */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Chargement...</span>
                  </>
                ) : (
                  <span>{mode === 'add' ? 'Ajouter' : 'Enregistrer'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;