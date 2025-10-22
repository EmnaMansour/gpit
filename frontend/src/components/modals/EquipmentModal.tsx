import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';

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
  equipmentTypes?: string[]; // 🔥 Rend optionnel
  equipmentStates?: string[]; // 🔥 Rend optionnel
}

// 🔥 LISTES PAR DÉFAUT POUR ÉVITER LES ERREURS
const DEFAULT_EQUIPMENT_TYPES = [
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

const DEFAULT_EQUIPMENT_STATES = [
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
  equipmentTypes = DEFAULT_EQUIPMENT_TYPES, // 🔥 Valeur par défaut
  equipmentStates = DEFAULT_EQUIPMENT_STATES // 🔥 Valeur par défaut
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
    console.log(' Initialisation modal - Mode:', mode);
    console.log(' Équipement reçu:', equipment);
    console.log(' Affectations disponibles:', affectations.length);
    console.log(' Employés disponibles:', employees.length);
    console.log(' Types disponibles:', equipmentTypes.length); // 🔥 Debug
    console.log(' États disponibles:', equipmentStates.length); // 🔥 Debug
    
    if (mode === 'edit' && equipment) {
      console.log(' MODE ÉDITION - Chargement données équipement:', equipment.nom);
      
      setFormData({
        nom: equipment.nom || '',
        type: equipment.type || '',
        numeroSerie: equipment.numeroSerie || '',
        dateAchat: equipment.dateAchat || '',
        statut: equipment.statut || 'Disponible'
      });

      if (equipment && equipment._id) {
        const currentAffectation = affectations.find(aff => {
          if (!aff || !aff.equipementId) return false;
          
          const affEquipmentId = typeof aff.equipementId === 'object' 
            ? aff.equipementId?._id || aff.equipementId 
            : aff.equipementId;
          
          const isMatch = affEquipmentId && 
                 affEquipmentId.toString() === equipment._id.toString() && 
                 !aff.dateRetour;
          
          console.log(` Recherche affectation - Équipement: ${equipment._id}, Trouvé: ${isMatch}`);
          return isMatch;
        });

        if (currentAffectation && currentAffectation.employeId) {
          const employeeId = typeof currentAffectation.employeId === 'object' 
            ? currentAffectation.employeId?._id || currentAffectation.employeId
            : currentAffectation.employeId;

          console.log(' Affectation trouvée:', {
            employeId: employeeId,
            etat: currentAffectation.etat
          });

          setAffectationData({
            employeId: employeeId || '',
            etat: currentAffectation.etat || 'Bon état'
          });
        } else {
          console.log(' Aucune affectation active trouvée');
          setAffectationData({
            employeId: '',
            etat: 'Bon état'
          });
        }
      }
    } else {
      console.log(' MODE AJOUT - Initialisation formulaire vide');
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

    // Log final des données initialisées
    setTimeout(() => {
      console.log(' Données initialisées:', { formData, affectationData });
    }, 100);
    
  }, [mode, equipment, affectations]); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
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
          {/* Informations de base de l'équipement */}
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

          {/* Assignation à un employé */}
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
                    .filter(emp => emp && emp._id)
                    .map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name} ({employee.email})
                      </option>
                    ))
                  }
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

          {/* Information d'assignation automatique */}
          {affectationData.employeId && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">
                Assignation automatique
              </h4>
              <p className="text-sm text-blue-300">
                L'équipement sera automatiquement assigné à l'employé sélectionné avec la date d'aujourd'hui. 
                Le statut passera automatiquement à "Assigné".
              </p>
            </div>
          )}

          {/* Boutons d'action */}
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

export default EquipmentModal;