"use strict";
const mongoose = require('mongoose');
const maintenanceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipement', required: true }, // Référence à Equipement
    scheduledDate: { type: Date, required: true }, // Date planifiée de la maintenance
    technician: { type: String, required: true }, // Nom du technicien en charge
    duration: { type: String, required: true }, // Durée de la maintenance
    description: { type: String, required: true }, // Description de la maintenance
    status: {
        type: String,
        enum: ['Planifiée', 'En cours', 'Terminée'], // Statuts de la maintenance
        default: 'Planifiée'
    }
});
const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
module.exports = Maintenance;
