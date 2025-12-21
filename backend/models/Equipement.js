const mongoose = require('mongoose');

const equipementSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
    enum: ['Disponible', 'Assigné', 'En panne', 'En maintenance', 'Réservé'],
    required: true,
    default: 'Disponible'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    // 🔥 VALIDATION: Vérifier que c'est un employé
    validate: {
      validator: async function(userId) {
        if (!userId) return true; // Null est OK (non assigné)
        
        const User = require('./User');
        const user = await User.findById(userId).select('role');
        
        if (!user) return false;
        
        const normalizeRole = (role) => {
          if (!role) return null;
          const normalized = role.toLowerCase().trim();
          const roleMap = {
            'employee': 'employee',
            'employe': 'employee',
            'employé': 'employee'
          };
          return roleMap[normalized] || normalized;
        };
        
        return normalizeRole(user.role) === 'employee';
      },
      message: 'Seuls les employés peuvent être assignés à un équipement'
    }
  },
  numeroSerie: {
    type: String,
    required: true,
    unique: true,
  },
  dateAchat: {
    type: Date,
    required: true,
  },
  qrCodePath: {
    type: String,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  affectations: [{
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateAffectation: { 
      type: Date, 
      default: Date.now 
    },
    dateRetour: { 
      type: Date, 
      default: null 
    },
    etat: { 
      type: String, 
      default: 'Bon état',
      enum: [
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
      ]
    }
  }],
}, {
  timestamps: true
});

// Index pour améliorer les performances
equipementSchema.index({ statut: 1 });
equipementSchema.index({ assignedTo: 1 });

module.exports = mongoose.models.Equipement || mongoose.model('Equipement', equipementSchema);