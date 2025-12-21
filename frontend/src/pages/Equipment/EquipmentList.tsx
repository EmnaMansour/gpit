import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Search,
  Plus,
  Filter,
  QrCode,
  Edit,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
  Package,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  Printer,
  UserMinus,
  Save,
  Loader
} from 'lucide-react';
import axios from 'axios';

// ===== INTERFACES =====
interface EquipmentListProps {
  userRole: 'Admin' | 'Technicien' | 'Employé';
  currentUserId?: string;
}

interface Equipment {
  _id: string;
  nom: string;
  type: string;
  statut: string;
  assignedTo?: string | null;
  numeroSerie: string;
  dateAchat: string;
  qrCodePath?: string;
  createdBy?: { _id: string; name: string; email: string; role?: string } | string;
  // updatedBy?: { _id: string; name: string; email: string; role?: string } | string;
}

// ===== À AJOUTER DANS LES FONCTIONS UTILITAIRES =====
const normalizeRoleDisplay = (role?: string): string => {
  if (!role) return 'Inconnu';
  const normalized = role.toLowerCase().trim();
  const map: Record<string, string> = {
    admin: 'Admin',
    administrateur: 'Admin',
    technicien: 'Technicien',
    technician: 'Technicien',
    employee: 'Employé',
    employe: 'Employé',
    employé: 'Employé',
  };
  return map[normalized] || 'Inconnu';
};

const getUserDisplay = (user: any, fallback: string = '-'): string => {
  if (!user) return fallback;

  let name = 'Inconnu';
  let role = '';

  if (typeof user === 'object' && user !== null) {
    name = user.name || user.email || 'Inconnu';
    role = user.role ? ` (${normalizeRoleDisplay(user.role)})` : '';
  } else if (typeof user === 'string') {
    name = user;
  }

  return `${name}${role}`;
};

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
}

interface Affectation {
  _id: string;
  employeId: any;
  equipementId: any;
  dateAffectation: string;
  dateRetour?: string;
  etat?: string;
}

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  equipment: any;
  mode: 'add' | 'edit';
  userRole: string;
  currentUserId?: string;
  affectations: any[];
  employees: any[];
  isLoading: boolean;
  equipmentTypes?: string[];
  equipmentStates?: string[];
}

// ===== CONSTANTES =====
const EQUIPMENT_TYPES = [
  'Ecran',
  'Ordinateur portable',
  'Ordinateur bureau', 
  'Souris',
  'Clavier',
  'Téléphone',
  'Tablette',
  'Imprimante',
  'Scanner',
  'Serveur',
  'Routeur',
  'Switch',
  'Access point',
  'Disque dur',
  'Clé USB',
  'Casque audio',
  'Webcam',
  'Projecteur',
  'Onduleur',
  'Autre'
];

const EQUIPMENT_STATES = [
  'Bon état',
  'Neuf', 
  'Usagé',
  'Rayures légères',
  'Rayures importantes',
  'Écran endommagé',
  'Clavier défectueux',
  'Batterie faible',
  'En réparation',
  'Autre'
];

// ===== MODAL ÉQUIPEMENT =====
const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  equipment,
  mode,
  userRole,
  currentUserId,
  affectations,
  employees,
  isLoading,
  equipmentTypes = EQUIPMENT_TYPES,
  equipmentStates = EQUIPMENT_STATES
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    numeroSerie: '',
    dateAchat: '',
    statut: 'Disponible'
  });

  const [affectationData, setAffectationData] = useState({
    employeId: '',
    etat: 'Bon état'
  });

  useEffect(() => {
    if (mode === 'edit' && equipment) {
      setFormData({
        nom: equipment.nom || '',
        type: equipment.type || '',
        numeroSerie: equipment.numeroSerie || '',
        dateAchat: equipment.dateAchat 
        ? new Date(equipment.dateAchat).toISOString().slice(0, 10) 
        : '',
                
        statut: equipment.statut || 'Disponible'
      });

      if (equipment && equipment._id) {
        const currentAffectation = affectations.find(aff => {
          if (!aff || !aff.equipementId) return false;
          
          const affEquipmentId = typeof aff.equipementId === 'object' 
            ? aff.equipementId?._id || aff.equipementId 
            : aff.equipementId;
          
          return affEquipmentId && 
                 affEquipmentId.toString() === equipment._id.toString() && 
                 !aff.dateRetour;
        });

        if (currentAffectation && currentAffectation.employeId) {
          const employeeId = typeof currentAffectation.employeId === 'object' 
            ? currentAffectation.employeId?._id || currentAffectation.employeId
            : currentAffectation.employeId;

          setAffectationData({
            employeId: employeeId || '',
            etat: currentAffectation.etat || 'Bon état'
          });
        } else {
          setAffectationData({
            employeId: '',
            etat: 'Bon état'
          });
        }
      }
    } else {
      setFormData({
        nom: '',
        type: '',
        numeroSerie: '',
        dateAchat: '',
        statut: 'Disponible'
      });
      setAffectationData({
        employeId: '',
        etat: 'Bon état'
      });
    }
  }, [mode, equipment, affectations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      alert('❌ Le nom de l\'équipement est obligatoire');
      return;
    }
    if (!formData.type) {
      alert('❌ Le type d\'équipement est obligatoire');
      return;
    }
    if (!formData.numeroSerie.trim()) {
      alert('❌ Le numéro de série est obligatoire');
      return;
    }
    if (!formData.dateAchat) {
      alert('❌ La date d\'achat est obligatoire');
      return;
    }
    if (affectationData.employeId && !affectationData.etat) {
      alert('❌ L\'état de l\'équipement est obligatoire lors de l\'assignation');
      return;
    }

    const saveData = {
      equipment: formData,
      affectation: affectationData.employeId ? affectationData : null,
      mode,
      existingEquipmentId: mode === 'edit' && equipment ? equipment._id : null
    };

    console.log('💾 Données à sauvegarder:', saveData);
    onSave(saveData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAffectationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAffectationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl border border-gray-700/50">
        <div className="flex justify-between items-center border-b border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <Save className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'add' ? 'Ajouter un équipement' : 'Modifier l\'équipement'}
              </h2>
              <p className="text-sm text-gray-400">
                {mode === 'add' ? 'Remplissez les informations du nouvel équipement' : 'Modifiez les informations de l\'équipement'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom de l'équipement *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="Ex: Ordinateur portable Dell"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type d'équipement *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="">Sélectionnez un type</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Numéro de série *
              </label>
              <input
                type="text"
                name="numeroSerie"
                value={formData.numeroSerie}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="Ex: SN123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date d'achat *
              </label>
              <input
                type="date"
                name="dateAchat"
                value={formData.dateAchat}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Assignation à un employé</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Employé assigné
                </label>
                <select
                  name="employeId"
                  value={affectationData.employeId}
                  onChange={handleAffectationChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="">Non assigné</option>
                {employees
                    .filter(emp => {
                      console.log("EMP:", emp); // debug
                      return (
                        emp &&
                        emp._id &&
                        (emp.role || emp.type) &&
                        ['employé', 'employe', 'employee'].includes(
                          (emp.role || emp.type).toLowerCase().trim()
                        )
                      );
                    })
                    .map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name} ({employee.email})
                      </option>
                    ))}


                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Laisser vide si l'équipement n'est pas assigné
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  État de l'équipement
                </label>
                <select
                  name="etat"
                  value={affectationData.etat}
                  onChange={handleAffectationChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  {equipmentStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  État obligatoire lors de l'assignation
                </p>
              </div>
            </div>
          </div>

          {affectationData.employeId && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">
                📋 Assignation automatique
              </h4>
              <p className="text-sm text-blue-300">
                <strong>L'équipement sera automatiquement assigné avec les détails suivants:</strong>
                <br/>• Employé: {employees.find(emp => emp._id === affectationData.employeId)?.name}
                <br/>• État: {affectationData.etat}
                <br/>• Date d'affectation: Aujourd'hui ({new Date().toLocaleDateString('fr-FR')})
                <br/>• Statut: Passera à "Assigné"
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{mode === 'add' ? 'Ajouter l\'équipement' : 'Modifier l\'équipement'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== MODAL QR CODE =====
const QRCodeModal = ({ 
  equipment, 
  isOpen, 
  onClose 
}: {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const qrData = JSON.stringify({
    id: equipment._id,
    nom: equipment.nom,
    serial: equipment.numeroSerie,
    type: equipment.type
  });

  const handlePrint = () => {
    const svg = document.getElementById('qr-svg') as SVGSVGElement | null;
    if (!svg) {
      alert("QR code non trouvé");
      return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], {type:"image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head><title>QR Code - ${equipment.nom}</title></head>
        <body style="text-align:center; font-family:sans-serif; padding:20px;">
          <h2>QR Code - ${equipment.nom}</h2>
          <img src="${url}" width="200" height="200" />
          <p><strong>Numéro de série:</strong> ${equipment.numeroSerie}</p>
          <p><strong>Type:</strong> ${equipment.type}</p>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        URL.revokeObjectURL(url);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-700/50">
        <div className="flex justify-between items-center border-b border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <QrCode className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">QR Code</h2>
              <p className="text-sm text-gray-400">{equipment.nom}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="border-2 border-gray-600 rounded-xl p-6 bg-gray-800/50">
              <QRCodeSVG 
                id="qr-svg"
                value={qrData} 
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#60a5fa"
                bgColor="transparent"
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-300">Numéro de série</p>
              <p className="text-lg font-mono text-blue-400">{equipment.numeroSerie}</p>
              <p className="text-sm text-gray-400">Type: ${equipment.type}</p>
              <p className="text-xs text-blue-400 mt-2 font-medium flex items-center justify-center">
                <Sparkles className="h-3 w-3 mr-1" />
                Scannez pour voir les détails
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-200 transform hover:scale-105"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== LOADING SKELETON =====
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

// ===== COMPOSANT PRINCIPAL =====
const EquipmentList: React.FC<EquipmentListProps> = ({ userRole, currentUserId }) => {
  const API_BASE_URL = 'http://localhost:8000/api';
  
  // États
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQREquipment, setSelectedQREquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Charger l'utilisateur courant
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          console.log('👤 Utilisateur chargé:', user);
        }
      } catch (error) {
        console.error('❌ Erreur chargement user:', error);
      }
    };
    loadUserData();
  }, []);

  const effectiveUserId = currentUserId || currentUser?.id || currentUser?._id;

  // ===== FONCTIONS UTILITAIRES =====
  
  const getEquipmentId = (affectation: Affectation): string => {
    if (typeof affectation.equipementId === 'object' && affectation.equipementId !== null) {
      return affectation.equipementId._id || affectation.equipementId;
    }
    return affectation.equipementId;
  };

  const getEmployeeId = (affectation: Affectation): string => {
    if (typeof affectation.employeId === 'object' && affectation.employeId !== null) {
      return affectation.employeId._id || affectation.employeId;
    }
    return affectation.employeId;
  };

  const isEquipmentAssignedToCurrentUser = (equipmentId: string): boolean => {
    if (!effectiveUserId) return false;
    
    try {
      const activeAffectation = affectations.find(aff => {
        const affEquipmentId = getEquipmentId(aff);
        const employeeId = getEmployeeId(aff);
        
        return affEquipmentId?.toString() === equipmentId.toString() && 
               employeeId?.toString() === effectiveUserId.toString() && 
               !aff.dateRetour;
      });
      
      return !!activeAffectation;
    } catch (error) {
      console.error("❌ Erreur vérification assignment:", error);
      return false;
    }
  };

  const getAssignedEmployee = (equipmentId: string): User | null => {
    if (userRole === 'Employé') return null;

    try {
      const activeAffectation = affectations.find(aff => {
        if (!aff) return false;
        const affEquipmentId = getEquipmentId(aff);
        return affEquipmentId?.toString() === equipmentId.toString() && !aff.dateRetour;
      });
      
      if (activeAffectation?.employeId) {
        if (typeof activeAffectation.employeId === 'object' && activeAffectation.employeId._id) {
          return activeAffectation.employeId;
        }
        const employeeId = typeof activeAffectation.employeId === 'string' 
          ? activeAffectation.employeId 
          : activeAffectation.employeId._id || activeAffectation.employeId;
        
        return employees.find(emp => emp._id === employeeId) || null;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Erreur recherche employé:", error);
      return null;
    }
  };

  const getAffectationEtat = (equipmentId: string): string => {
    try {
      const activeAffectation = affectations.find(aff => {
        if (!aff) return false;
        const affEquipmentId = getEquipmentId(aff);
        const employeeId = getEmployeeId(aff);
        
        const isEquipmentMatch = affEquipmentId?.toString() === equipmentId.toString();
        const isEmployeeMatch = userRole === 'Employé' 
          ? employeeId?.toString() === effectiveUserId?.toString()
          : true;
        
        return isEquipmentMatch && isEmployeeMatch && !aff.dateRetour;
      });
      
      return activeAffectation?.etat || '-';
    } catch (error) {
      console.error("❌ Erreur recherche état:", error);
      return '-';
    }
  };

  const getAffectationDate = (equipmentId: string): string => {
    try {
      const activeAffectation = affectations.find(aff => {
        if (!aff) return false;
        const affEquipmentId = getEquipmentId(aff);
        const employeeId = getEmployeeId(aff);
        
        const isEquipmentMatch = affEquipmentId?.toString() === equipmentId.toString();
        const isEmployeeMatch = userRole === 'Employé' 
          ? employeeId?.toString() === effectiveUserId?.toString()
          : true;
        
        return isEquipmentMatch && isEmployeeMatch && !aff.dateRetour;
      });
      
      return activeAffectation?.dateAffectation || '-';
    } catch (error) {
      console.error("❌ Erreur recherche date:", error);
      return '-';
    }
  };

  const getAffectationId = (equipmentId: string): string | null => {
    try {
      const activeAffectation = affectations.find(aff => {
        const affEquipmentId = getEquipmentId(aff);
        const employeeId = getEmployeeId(aff);
        
        const isEquipmentMatch = affEquipmentId?.toString() === equipmentId.toString();
        const isEmployeeMatch = userRole === 'Employé' 
          ? employeeId?.toString() === effectiveUserId?.toString()
          : true;
        
        return isEquipmentMatch && isEmployeeMatch && !aff.dateRetour;
      });
      
      return activeAffectation?._id || null;
    } catch (error) {
      console.error("❌ Erreur recherche ID affectation:", error);
      return null;
    }
  };

  // ===== FONCTIONS API =====
  
  const getAuthToken = (): string | null => {
    const token = 
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('userToken');
    
    return token ? token.replace(/"/g, '').trim() : null;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    return headers;
  };

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipements`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      
      let equipmentData = [];
      
      if (Array.isArray(response.data)) {
        equipmentData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        equipmentData = response.data.data || response.data.equipements || response.data.equipments || [response.data];
      }
      
      console.log(`✅ ${equipmentData.length} équipements chargés`);
      setEquipmentData(equipmentData);
      return equipmentData;
    } catch (error) {
      console.error('❌ Erreur fetchEquipment:', error);
      setEquipmentData([]);
      return [];
    }
  };

  const fetchAffectations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/affectations`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      
      const affectationsData = Array.isArray(response.data) ? response.data : 
                             response.data?.data || response.data?.affectations || [];
      
      console.log(`✅ ${affectationsData.length} affectations chargées`);
      setAffectations(affectationsData);
      return affectationsData;
    } catch (error) {
      console.error("❌ Erreur fetchAffectations:", error);
      setAffectations([]);
      return [];
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/utilisateur`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      
      let usersData = [];
      
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        usersData = response.data.data || response.data.users || response.data.utilisateurs || [response.data];
      }
      
      console.log(`✅ ${usersData.length} employés chargés`);
      setEmployees(usersData);
      return usersData;
    } catch (error) {
      console.error("❌ Erreur fetchEmployees:", error);
      setEmployees([]);
      return [];
    }
  };

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      console.log('\n🔄 Chargement des données...');
      
      const [equipmentResult, affectationsResult, employeesResult] = await Promise.allSettled([
        fetchEquipment(),
        fetchAffectations(),
        fetchEmployees()
      ]);

      console.log('\n📊 Résultats du chargement:');
      console.log('- Équipements:', equipmentResult.status === 'fulfilled' ? `✅ ${equipmentResult.value.length}` : '❌ Erreur');
      console.log('- Affectations:', affectationsResult.status === 'fulfilled' ? `✅ ${affectationsResult.value.length}` : '❌ Erreur');
      console.log('- Employés:', employeesResult.status === 'fulfilled' ? `✅ ${employeesResult.value.length}` : '❌ Erreur');
      
    } catch (error) {
      console.error("❌ Erreur chargement données:", error);
      setError('Erreur de chargement des données');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (effectiveUserId) {
      loadData();
    }
  }, [effectiveUserId, userRole]);

  // ===== FILTRAGE DES ÉQUIPEMENTS =====
  
  const getVisibleEquipment = () => {
    let visibleEquipment = equipmentData;

    if (userRole === 'Employé' && effectiveUserId) {
      visibleEquipment = equipmentData.filter(equipment => 
        isEquipmentAssignedToCurrentUser(equipment._id)
      );
    }

    return visibleEquipment
      .filter((item) => filterStatus === 'all' || item.statut === filterStatus)
      .filter((item) =>
        item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const filteredEquipment = getVisibleEquipment();

  // ===== HANDLERS =====
  
 // ✅ CORRECTION - Dans EquipmentList component - handleSaveEquipment

// ✅ VERSION FINALE - Remplace handleSaveEquipment dans EquipmentList.tsx

const handleSaveEquipment = async (saveData: any) => {
  setApiLoading(true);
  try {
    const { equipment, affectation, mode, existingEquipmentId } = saveData;

    console.log('🔍 [SAVE] Données reçues:', saveData);

    // Validation
    if (!equipment.nom?.trim() || !equipment.type || !equipment.numeroSerie?.trim() || !equipment.dateAchat) {
      alert('❌ Tous les champs obligatoires doivent être remplis');
      setApiLoading(false);
      return;
    }

    const createdById = effectiveUserId;
    const today = new Date().toISOString();

    if (mode === 'add') {
      console.log('➕ [MODE AJOUT]');
      
      // 🔥 CORRECTION: Le backend attend { equipment: {...}, affectation: {...} }
     const payload = {
  equipment: {
    nom: equipment.nom.trim(),
    type: equipment.type,
    numeroSerie: equipment.numeroSerie.trim().toUpperCase(),
    dateAchat: equipment.dateAchat,
    statut: affectation?.employeId ? "Assigné" : "Disponible"
  },
  affectation: affectation?.employeId ? {
    employeId: affectation.employeId,
    etat: affectation.etat || 'Bon état'
  } : null
};


      console.log('📦 [ÉTAPE 1] Création équipement avec payload:', JSON.stringify(payload, null, 2));
      console.log('🔍 Affectation envoyée:', payload.affectation);

      const equipmentResponse = await axios.post(
        `${API_BASE_URL}/equipements`, 
        payload,
        {
          headers: getAuthHeaders(),
          timeout: 15000
        }
      );
      
      const newEquipment = equipmentResponse.data?.data || equipmentResponse.data;

      console.log('✅ Équipement créé:', newEquipment);
      console.log('📋 Affectations dans l\'équipement:', newEquipment?.affectations);
      console.log('👤 AssignedTo:', newEquipment?.assignedTo);
      console.log('📊 Statut:', newEquipment?.statut);

      if (affectation?.employeId) {
        const assignedEmployee = employees.find(emp => emp._id === affectation.employeId);
        
        alert(`✅ Équipement créé et assigné avec succès !

📦 Équipement:
• Nom: ${equipment.nom}
• Type: ${equipment.type}
• N° série: ${equipment.numeroSerie}
• Statut: Assigné

👤 Assignation:
• Employé: ${assignedEmployee?.name || 'Inconnu'}
• Email: ${assignedEmployee?.email || '-'}
• État: ${affectation.etat}
• Date: ${new Date().toLocaleDateString('fr-FR')}`);
      } else {
        alert(`✅ Équipement créé avec succès !

📦 Détails:
• Nom: ${equipment.nom}
• Type: ${equipment.type}
• N° série: ${equipment.numeroSerie}
• Statut: Disponible
• Date achat: ${new Date(equipment.dateAchat).toLocaleDateString('fr-FR')}`);
      }

    } else {
      // ========================================
      // MODE ÉDITION
      // ========================================
      console.log('✏️ [MODE ÉDITION] ID:', existingEquipmentId);
      
      const payload = {
        equipment: {
          nom: equipment.nom.trim(),
          type: equipment.type,
          numeroSerie: equipment.numeroSerie.trim().toUpperCase(),
          dateAchat: equipment.dateAchat
        },
        affectation: affectation?.employeId ? {
          employeId: affectation.employeId,
          etat: affectation.etat || 'Bon état'
        } : null
      };

      console.log('📝 Mise à jour avec payload:', JSON.stringify(payload, null, 2));

      await axios.put(
        `${API_BASE_URL}/equipements/${existingEquipmentId}`,
        payload,
        {
          headers: getAuthHeaders(),
          timeout: 15000
        }
      );

      if (affectation?.employeId) {
        const assignedEmployee = employees.find(emp => emp._id === affectation.employeId);
        alert(`✅ Équipement modifié et assigné !

• ${equipment.nom}
• Assigné à: ${assignedEmployee?.name}
• État: ${affectation.etat}
• Date: ${new Date().toLocaleDateString('fr-FR')}`);
      } else {
        alert(`✅ Équipement modifié !

• ${equipment.nom}
• Statut: Disponible`);
      }
    }

    // Recharger les données
    console.log('🔄 Rechargement des données...');
    await loadData();
    
    setIsModalOpen(false);
    setSelectedEquipment(null);
    
  } catch (error: any) {
    console.error('❌ [SAVE] Erreur complète:', error);
    
    let errorMessage = "Erreur lors de la sauvegarde";
    
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      errorMessage = responseData?.message || error.message;
      
      console.error('Status:', error.response?.status);
      console.error('Response:', JSON.stringify(responseData, null, 2));
      console.error('Request:', JSON.stringify(error.config?.data, null, 2));
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    alert(`❌ ${errorMessage}`);
  } finally {
    setApiLoading(false);
  }
};
  const handleAdd = () => {
    setSelectedEquipment(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (equipmentId: string) => {
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer cet équipement?")) return;
    
    setApiLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/equipements/${equipmentId}`, {
        headers: getAuthHeaders(),
        timeout: 15000
      });
      
      setEquipmentData(prev => prev.filter(item => item._id !== equipmentId));
      alert('✅ Équipement supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert("❌ Erreur lors de la suppression");
    } finally {
      setApiLoading(false);
    }
  };

  const handleQRCode = (equipment: Equipment) => {
    if (!equipment?.numeroSerie) {
      alert('❌ Numéro de série manquant');
      return;
    }
    setSelectedQREquipment(equipment);
    setIsQRModalOpen(true);
  };

  const handleUnassign = async (equipmentId: string) => {
    const affectationId = getAffectationId(equipmentId);
    if (!affectationId) {
      alert("❌ Aucune affectation trouvée");
      return;
    }
    
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir désaffecter cet équipement?")) return;

    setApiLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/affectations/${affectationId}`, {
        dateRetour: new Date().toISOString(),
        updatedBy: effectiveUserId
      }, {
        headers: getAuthHeaders(),
        timeout: 15000
      });
      
      await axios.put(`${API_BASE_URL}/equipements/${equipmentId}`, {
        statut: 'Disponible',
        updatedBy: effectiveUserId
      }, {
        headers: getAuthHeaders(),
        timeout: 15000
      });
      
      alert('✅ Équipement désaffecté avec succès');
      await loadData();
    } catch (error) {
      console.error('❌ Erreur désaffectation:', error);
      alert("❌ Erreur lors de la désaffectation");
    } finally {
      setApiLoading(false);
    }
  };

  // ===== PERMISSIONS =====
  
  const canAddEditEquipment = () => userRole === 'Admin' || userRole === 'Technicien';
  const canDeleteEquipment = () => userRole === 'Admin' || userRole === 'Technicien';
  const canViewQRCode = () => true;
  const canUnassignEquipment = () => userRole === 'Admin' || userRole === 'Technicien';

  // ===== UTILITAIRES UI =====
  
  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'Disponible': return <CheckCircle className="h-4 w-4" />;
      case 'En panne': return <AlertTriangle className="h-4 w-4" />;
      case 'En maintenance': return <Clock className="h-4 w-4" />;
      case 'Assigné': return <User className="h-4 w-4" />;
      case 'Réservé': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Disponible': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Assigné': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'En panne': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'En maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Réservé': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '-') return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // ===== RENDU =====
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-6 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent mb-2">
              {userRole === 'Employé' ? 'Mes équipements assignés' : 'Gestion des équipements'}
            </h2>
            <p className="text-gray-400">
              {filteredEquipment.length} équipement{filteredEquipment.length !== 1 ? 's' : ''} 
              {equipmentData.length > 0 && userRole !== 'Employé' && ` sur ${equipmentData.length} au total`}
              {userRole === 'Employé' && ` assigné${filteredEquipment.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-200 disabled:opacity-50 border border-gray-600"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </button>
            
            {canAddEditEquipment() && (
              <button
                onClick={handleAdd}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                disabled={apiLoading}
              >
                <Plus className="h-5 w-5" />
                <span>Ajouter un équipement</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative w-full lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={userRole === 'Employé' ? "Rechercher dans mes équipements..." : "Rechercher un équipement..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="Disponible">Disponible</option>
                <option value="Assigné">Assigné</option>
                <option value="En panne">En panne</option>
                <option value="En maintenance">En maintenance</option>
                <option value="Réservé">Réservé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
      <thead className="bg-gray-800/50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ÉQUIPEMENT</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">TYPE</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">STATUT</th>
          {(userRole === 'Admin' || userRole === 'Technicien') && (
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">EMPLOYÉ ASSIGNÉ</th>
          )}
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ÉTAT</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">DATE D'AFFECTATION</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">N° DE SÉRIE</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">DATE D'ACHAT</th>
          
          {/* 🔥 NOUVELLES COLONNES - visibles seulement pour Admin/Technicien */}
          {userRole !== 'Employé' && (
            <>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">CRÉÉ PAR</th>
              {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">MODIFIÉ PAR</th> */}
            </>
          )}
          
          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">ACTIONS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700/50">
        {filteredEquipment.map((equipment) => {
          const assignedEmployee = getAssignedEmployee(equipment._id);
          const affectationEtat = getAffectationEtat(equipment._id);
          const affectationDate = getAffectationDate(equipment._id);
          
          return (
            <tr key={equipment._id} className="hover:bg-gray-800/30 transition-colors duration-200">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-400 mr-3" />
                  <div className="text-sm font-semibold text-white">{equipment.nom}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-300">{equipment.type}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(equipment.statut)}`}>
                  {getStatusIcon(equipment.statut)}
                  <span className="ml-1">{equipment.statut}</span>
                </span>
              </td>
              {(userRole === 'Admin' || userRole === 'Technicien') && (
                <td className="px-6 py-4 text-sm text-gray-300">
                  {assignedEmployee ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-green-400 mr-2" />
                      <span>{assignedEmployee.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              )}
              <td className="px-6 py-4 text-sm text-gray-300">
                {affectationEtat !== '-' ? (
                  <span className="capitalize bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-600">
                    {affectationEtat}
                  </span>
                ) : (
                  <span className="text-gray-500 italic">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-300">
                {affectationDate !== '-' ? (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-blue-400" />
                    {formatDate(affectationDate)}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm font-mono text-blue-400">{equipment.numeroSerie}</td>
              <td className="px-6 py-4 text-sm text-gray-300">{formatDate(equipment.dateAchat)}</td>
              
              {/* 🔥 NOUVELLES CELLULES */}
              {userRole !== 'Employé' && (
                <>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-cyan-400 mr-2" />
                      <span>{getUserDisplay(equipment.createdBy)}</span>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 text-sm text-gray-300">
                    {equipment.updatedBy ? (
                      <div className="flex items-center">
                        <Edit className="h-4 w-4 text-orange-400 mr-2" />
                        <span>{getUserDisplay(equipment.updatedBy)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">-</span>
                    )}
                  </td> */}
                </>
              )}
              
              <td className="px-6 py-4 text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {canViewQRCode() && (
                    <button onClick={() => handleQRCode(equipment)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-xl transition-all duration-200 border border-blue-500/30" title="Générer QR Code">
                      <QrCode className="h-4 w-4" />
                    </button>
                  )}
                  {canAddEditEquipment() && (
                    <button onClick={() => handleEdit(equipment)} className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all duration-200 border border-green-500/30" title="Modifier">
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {canUnassignEquipment() && equipment.statut === 'Assigné' && (
                    <button onClick={() => handleUnassign(equipment._id)} className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded-xl transition-all duration-200 border border-orange-500/30" title="Désaffecter">
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                  {canDeleteEquipment() && (
                    <button onClick={() => handleDelete(equipment._id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 border border-red-500/30" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
          </div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucun équipement trouvé' 
                  : userRole === 'Employé' 
                    ? 'Aucun équipement assigné'
                    : 'Aucun équipement disponible'
                }
              </h3>
              {(searchTerm || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <EquipmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEquipment(null);
          }}
          onSave={handleSaveEquipment}
          equipment={selectedEquipment}
          mode={modalMode}
          userRole={userRole}
          currentUserId={effectiveUserId}
          affectations={affectations || []}
          employees={employees || []}
          isLoading={apiLoading}
          equipmentTypes={EQUIPMENT_TYPES}
          equipmentStates={EQUIPMENT_STATES}
        />
      )}

      {selectedQREquipment && (
        <QRCodeModal
          equipment={selectedQREquipment}
          isOpen={isQRModalOpen}
          onClose={() => {
            setIsQRModalOpen(false);
            setSelectedQREquipment(null);
          }}
        />
      )}

      {apiLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
            <span className="text-white font-medium">Traitement en cours...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;