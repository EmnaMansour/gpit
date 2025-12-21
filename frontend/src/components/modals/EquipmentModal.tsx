import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  equipment?: any; // Peut être undefined en mode ajout
  mode: 'add' | 'edit';
  employees: any[]; // Liste complète des utilisateurs
  isLoading: boolean;
  equipmentTypes?: string[];
  equipmentStates?: string[];
}

// 🔥 NORMALISATION DU RÔLE (identique au backend)
const normalizeRole = (role: string | undefined | null): string => {
  if (!role) return '';
  const normalized = role.toLowerCase().trim();

  const roleMap: { [key: string]: string } = {
    'employee': 'employee',
    'employe': 'employee',
    'employé': 'employee',
    'admin': 'admin',
    'administrator': 'admin',
    'administrateur': 'admin',
    'technicien': 'technician',
    'technician': 'technician',
    'tech': 'technician'
  };

  return roleMap[normalized] || normalized;
};

const DEFAULT_EQUIPMENT_TYPES = [
  'Ecran', 'Ordinateur portable', 'Ordinateur bureau', 'Souris', 'Clavier',
  'Téléphone', 'Tablette', 'Imprimante', 'Scanner', 'Serveur',
  'Routeur', 'Switch', 'Access point', 'Disque dur', 'Clé USB',
  'Casque audio', 'Webcam', 'Projecteur', 'Onduleur', 'Autre'
];

const DEFAULT_EQUIPMENT_STATES = [
  'Bon état', 'Neuf', 'Usagé', 'Rayures légères', 'Rayures importantes',
  'Écran endommagé', 'Clavier défectueux', 'Batterie faible',
  'En réparation', 'Autre'
];

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  equipment,
  mode,
  employees,
  isLoading,
  equipmentTypes = DEFAULT_EQUIPMENT_TYPES,
  equipmentStates = DEFAULT_EQUIPMENT_STATES
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    numeroSerie: '',
    dateAchat: ''
  });

  const [affectationData, setAffectationData] = useState<{
    employeId: string;
    etat: string;
  }>({
    employeId: '',
    etat: 'Bon état'
  });

  // 🔥 Seulement les vrais employés dans le select
  const employeesOnly = employees.filter(emp => {
    if (!emp?._id || !emp.role) return false;
    return normalizeRole(emp.role) === 'employee';
  });

  // Sécurité frontend : vérifie que l'ID choisi est bien un employé
  const isValidEmployeeId = (id: string): boolean => {
    if (!id) return true;
    return employeesOnly.some(emp => emp._id === id);
  };

  // Initialisation du formulaire
  useEffect(() => {
    if (mode === 'edit' && equipment) {
      setFormData({
        nom: equipment.nom || '',
        type: equipment.type || '',
        numeroSerie: equipment.numeroSerie || '',
        dateAchat: equipment.dateAchat ? equipment.dateAchat.slice(0, 10) : '' // Format YYYY-MM-DD
      });

      // Récupérer l'assignation actuelle via assignedTo ou l'historique
      if (equipment.assignedTo?._id || equipment.assignedTo) {
const currentEmployeeId = equipment?.assignedTo?._id || (typeof equipment?.assignedTo === 'string' ? equipment.assignedTo : '');
        // Trouver l'état dans la dernière affectation active
        const activeAffectation = equipment.affectations?.find(
          (aff: any) => !aff.dateRetour && aff.assignedTo.toString() === currentEmployeeId.toString()
        );

        setAffectationData({
          employeId: currentEmployeeId,
          etat: activeAffectation?.etat || 'Bon état'
        });
      } else {
        setAffectationData({ employeId: '', etat: 'Bon état' });
      }
    } else {
      // Mode ajout
      setFormData({ nom: '', type: '', numeroSerie: '', dateAchat: '' });
      setAffectationData({ employeId: '', etat: 'Bon état' });
    }
  }, [mode, equipment, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) return alert('❌ Nom obligatoire');
    if (!formData.type) return alert('❌ Type obligatoire');
    if (!formData.numeroSerie.trim()) return alert('❌ Numéro de série obligatoire');
    if (!formData.dateAchat) return alert('❌ Date d\'achat obligatoire');

    if (affectationData.employeId && !isValidEmployeeId(affectationData.employeId)) {
      return alert('❌ Assignation impossible : seul un employé peut recevoir un équipement');
    }

    if (affectationData.employeId && !affectationData.etat) {
      return alert('❌ L\'état est obligatoire lors de l\'assignation');
    }

    const saveData = {
      equipment: {
        nom: formData.nom.trim(),
        type: formData.type,
        numeroSerie: formData.numeroSerie.trim().toUpperCase(),
        dateAchat: formData.dateAchat
      },
      affectation: affectationData.employeId
        ? { employeId: affectationData.employeId, etat: affectationData.etat }
        : null
    };

    onSave(saveData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAffectationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAffectationData(prev => ({ ...prev, [name]: value }));
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
                Gestion de l'inventaire matériel
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom de l'équipement *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Ex: MacBook Pro 16\""
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type d'équipement *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="">Sélectionnez un type</option>
                {equipmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Numéro de série *</label>
              <input
                type="text"
                name="numeroSerie"
                value={formData.numeroSerie}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Ex: C02Z1234ABCD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date d'achat *</label>
              <input
                type="date"
                name="dateAchat"
                value={formData.dateAchat}
                onChange={handleChange}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Assignation à un employé</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Employé assigné</label>
                <select
                  name="employeId"
                  value={affectationData.employeId}
                  onChange={handleAffectationChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Non assigné (disponible)</option>
                  {employeesOnly.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-green-400 mt-2">
                  ✅ {employeesOnly.length} employé(s) disponible(s) • Sécurité renforcée
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">État lors de l'assignation</label>
                <select
                  name="etat"
                  value={affectationData.etat}
                  onChange={handleAffectationChange}
                  disabled={!affectationData.employeId}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white disabled:opacity-50"
                >
                  {equipmentStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Obligatoire lors de l'assignation
                </p>
              </div>
            </div>
          </div>

          {affectationData.employeId && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Assignation confirmée</h4>
              <p className="text-sm text-blue-300">
                L’équipement sera assigné aujourd’hui et passera automatiquement au statut <strong>"Assigné"</strong>.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 disabled:opacity-50"
            >
              {isLoading ? (
                <> <Loader className="h-4 w-4 animate-spin" /> <span>Traitement...</span> </>
              ) : (
                <> <Save className="h-4 w-4" /> <span>{mode === 'add' ? 'Ajouter' : 'Enregistrer'}</span> </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentModal;