"use strict";
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
        default: null
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notes: {
        type: String,
        default: '',
        maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères']
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
// Index pour améliorer les performances
incidentSchema.index({ status: 1, createdAt: -1 });
incidentSchema.index({ equipment: 1 });
incidentSchema.index({ assignedTo: 1 });
// Middleware pour mettre à jour resolvedAt automatiquement
incidentSchema.pre('save', function (next) {
    if (this.status === 'Résolu' && !this.resolvedAt) {
        this.resolvedAt = new Date();
    }
    else if (this.status !== 'Résolu') {
        this.resolvedAt = null;
    }
    next();
});
// Méthode pour obtenir la durée de résolution
incidentSchema.methods.getResolutionTime = function () {
    if (this.resolvedAt) {
        return Math.round((this.resolvedAt - this.createdAt) / (1000 * 60 * 60)); // en heures
    }
    return null;
};
module.exports = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);
