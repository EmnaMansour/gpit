"use strict";
const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipement');
const Incident = require('../models/Incident');
const User = require('../models/User');
router.get('/', async (req, res) => {
    try {
        // Statistiques des équipements
        const totalEquipment = await Equipment.countDocuments();
        // Statistiques des incidents
        const activeIncidents = await Incident.countDocuments({ status: 'En cours' });
        const resolvedIncidents = await Incident.countDocuments({ status: 'Résolu' });
        const totalIncidents = await Incident.countDocuments(); // Nouveau: total incidents
        // Statistiques des utilisateurs
        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'Administrateur' });
        const technicienCount = await User.countDocuments({ role: 'Technicien' });
        const employeCount = await User.countDocuments({ role: 'Employé' });
        // Derniers incidents (par date descendante)
        const recentIncidents = await Incident.find()
            .sort({ createdAt: -1 }) // Utilisez createdAt si c'est le nom du champ
            .limit(5)
            .select('title status priority createdAt assignedTo');
        // État des équipements - Assurez-vous que ces statuts correspondent à votre modèle
        const availableCount = await Equipment.countDocuments({ status: 'Disponible' });
        const brokenCount = await Equipment.countDocuments({ status: 'En panne' });
        const reservedCount = await Equipment.countDocuments({ status: 'Réservé' });
        const maintenanceCount = await Equipment.countDocuments({ status: 'Maintenance' });
        res.json({
            success: true, // Ajoutez ceci
            stats: {
                totalEquipment,
                activeIncidents,
                resolvedIncidents,
                totalIncidents, // Nouveau
                totalUsers,
                adminCount,
                technicienCount,
                employeCount,
            },
            recentIncidents: recentIncidents.map(incident => ({
                id: incident._id,
                title: incident.title,
                status: incident.status,
                priority: incident.priority,
                date: incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('fr-FR') : null,
                assignedTo: incident.assignedTo
            })),
            equipmentStatus: [
                { status: 'Disponible', count: availableCount },
                { status: 'En panne', count: brokenCount },
                { status: 'Réservé', count: reservedCount },
                { status: 'En maintenance', count: maintenanceCount },
            ],
        });
    }
    catch (err) {
        console.error('Erreur dashboard:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: err.message
        });
    }
});
module.exports = router;
