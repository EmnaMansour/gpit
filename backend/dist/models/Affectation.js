"use strict";
const mongoose = require('mongoose');
const affectationSchema = new mongoose.Schema({
    employeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    equipementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipement' },
    dateAffectation: { type: Date, default: Date.now },
    dateRetour: { type: Date },
    etat: { type: String } // optionnel : état de l’équipement lors de l’affectation
});
module.exports = mongoose.models.Affectation || mongoose.model('Affectation', affectationSchema);
