// models/Incident.js
const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: { 
    type: String, 
    required: [true, 'La description est obligatoire'],
    trim: true,
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Equipement',
    required: [true, 'L\'équipement est obligatoire']
  },
  status: {
    type: String,
    enum: {
      values: ['Nouveau', 'En cours', 'Résolu'],
      message: 'Le statut doit être: Nouveau, En cours ou Résolu'
    },
    default: 'Nouveau'
  },
  priority: { 
    type: String, 
    enum: {
      values: ['Basse', 'Moyenne', 'Élevée'],
      message: 'La priorité doit être: Basse, Moyenne ou Élevée'
    },
    default: 'Moyenne' 
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  // Toujours obligatoire (l'incident doit être déclaré par quelqu'un)
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // 🔥 NOUVEAU : Qui a résolu l'incident
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: '',
    maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères']
  }
}, { 
  timestamps: true 
});

// Index pour performances
incidentSchema.index({ status: 1, createdAt: -1 });
incidentSchema.index({ equipment: 1 });
incidentSchema.index({ assignedTo: 1 });
incidentSchema.index({ reportedBy: 1 });
incidentSchema.index({ resolvedBy: 1 });

// 🔥 Middleware amélioré : capture automatiquement qui résout l'incident
incidentSchema.pre('save', function(next) {
  // Si le statut passe à "Résolu" (et qu'il ne l'était pas avant)
  if (this.isModified('status') && this.status === 'Résolu') {
    if (!this.resolvedAt) {
      this.resolvedAt = new Date();
    }
    // Important : resolvedBy doit être défini par le contrôleur (req.user._id)
    // Mais on peut ajouter une sécurité ici si jamais il manque
    if (!this.resolvedBy && this._update?.$set?.resolvedBy) {
      this.resolvedBy = this._update.$set.resolvedBy;
    }
  } 
  // Si on repasse à non-résolu
  else if (this.isModified('status') && this.status !== 'Résolu') {
    this.resolvedAt = null;
    this.resolvedBy = null;
  }
  
  next();
});

// Méthode pour calculer la durée de résolution en heures
incidentSchema.methods.getResolutionTime = function() {
  if (this.resolvedAt && this.createdAt) {
    const diffInMs = this.resolvedAt - this.createdAt;
    return Math.round(diffInMs / (1000 * 60 * 60)); // Retourne les heures
  }
  return null;
};

// Optionnel : Virtual pour afficher un texte clair
incidentSchema.virtual('resolutionInfo').get(function() {
  if (this.status === 'Résolu' && this.resolvedBy && this.resolvedAt) {
    return {
      by: this.resolvedBy,
      at: this.resolvedAt,
      durationHours: this.getResolutionTime()
    };
  }
  return null;
});

module.exports = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);