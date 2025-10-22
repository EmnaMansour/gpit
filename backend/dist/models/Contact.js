"use strict";
// models/Contact.js
const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true,
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format d\'email invalide']
    },
    company: {
        type: String,
        trim: true,
        maxlength: [200, 'Le nom de l\'entreprise ne peut pas dépasser 200 caractères'],
        default: 'Non spécifié'
    },
    message: {
        type: String,
        required: [true, 'Le message est obligatoire'],
        trim: true,
        maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères']
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied', 'archived'],
        default: 'pending'
    },
    read: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
    }
}, {
    timestamps: true
});
// Index pour les recherches fréquentes
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ read: 1 });
// Méthode pour formater l'affichage
contactSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        company: this.company,
        message: this.message,
        status: this.status,
        read: this.read,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};
// Middleware pre-save pour validation supplémentaire
contactSchema.pre('save', function (next) {
    console.log(`💾 Sauvegarde contact: ${this.name} (${this.email})`);
    next();
});
module.exports = mongoose.model('Contact', contactSchema);
