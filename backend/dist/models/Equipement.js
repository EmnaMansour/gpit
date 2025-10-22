"use strict";
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
    // ✅ CHANGÉ: De String à ObjectId
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
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
    affectations: [{
            assignedTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            dateAffectation: { type: Date, default: Date.now },
        }],
}, {
    timestamps: true
});
module.exports = mongoose.models.Equipement || mongoose.model('Equipement', equipementSchema);
