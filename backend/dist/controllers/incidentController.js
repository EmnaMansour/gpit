"use strict";
const Incident = require('../models/Incident');
// Obtenir tous les incidents
const getIncidents = async (req, res) => {
    try {
        let filter = {};
        console.log('🔍 Récupération incidents - Utilisateur:', {
            userId: req.user?._id,
            role: req.user?.role,
            email: req.user?.email
        });
        // ✅ SEULEMENT pour les employés : ils voient leurs propres incidents
        if (req.user && req.user.role === 'employe') {
            filter.reportedBy = req.user._id;
            console.log(`🔍 Filtre employé appliqué: ${req.user._id} - ${req.user.name}`);
        }
        // ✅ Admin et Technicien voient TOUS les incidents (pas de filtre)
        const incidents = await Incident.find(filter)
            .populate('equipment', 'name serialNumber type')
            .populate('reportedBy', 'name email role')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        console.log(`📊 ${incidents.length} incidents trouvés pour ${req.user?.name} (rôle: ${req.user?.role})`);
        res.json({
            count: incidents.length,
            incidents: incidents
        });
    }
    catch (error) {
        console.error('❌ Erreur récupération incidents:', error);
        res.status(500).json({ error: error.message });
    }
};
// Obtenir un incident spécifique
const getIncident = async (req, res) => {
    try {
        let filter = { _id: req.params.id };
        // ✅ SEULEMENT pour les employés : vérifier qu'ils ont créé cet incident
        if (req.user && req.user.role === 'employe') {
            filter.reportedBy = req.user._id;
        }
        // ✅ Admin et Technicien peuvent accéder à tous les incidents
        const incident = await Incident.findOne(filter)
            .populate('equipment', 'name serialNumber location type')
            .populate('reportedBy', 'name email role')
            .populate('assignedTo', 'name email');
        if (!incident) {
            return res.status(404).json({
                error: 'Incident non trouvé ou accès non autorisé'
            });
        }
        res.json(incident);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Mettre à jour un incident
const updateIncident = async (req, res) => {
    try {
        let filter = { _id: req.params.id };
        // ✅ SEULEMENT pour les employés : vérifier qu'ils ont créé cet incident
        if (req.user && req.user.role === 'employe') {
            filter.reportedBy = req.user._id;
        }
        // ✅ Admin et Technicien peuvent modifier tous les incidents
        const incidentExists = await Incident.findOne(filter);
        if (!incidentExists) {
            return res.status(404).json({
                error: 'Incident non trouvé ou accès non autorisé'
            });
        }
        const updatedIncident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('equipment', 'name serialNumber')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email');
        res.json({
            message: 'Incident mis à jour avec succès',
            incident: updatedIncident
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// Supprimer un incident
const deleteIncident = async (req, res) => {
    try {
        let filter = { _id: req.params.id };
        // ✅ SEULEMENT pour les employés : vérifier qu'ils ont créé cet incident
        if (req.user && req.user.role === 'employe') {
            filter.reportedBy = req.user._id;
        }
        // ✅ Admin peut supprimer tous les incidents
        const incident = await Incident.findOneAndDelete(filter);
        if (!incident) {
            return res.status(404).json({
                error: 'Incident non trouvé ou accès non autorisé'
            });
        }
        res.json({ message: 'Incident supprimé avec succès' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Incidents récents
const recentIncidents = async (req, res) => {
    try {
        let filter = {};
        // ✅ SEULEMENT pour les employés : seulement leurs incidents
        if (req.user && req.user.role === 'employe') {
            filter.reportedBy = req.user._id;
        }
        // ✅ Admin et Technicien voient tous les incidents récents
        const incidents = await Incident.find(filter)
            .populate('equipment', 'name')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json({
            count: incidents.length,
            incidents: incidents
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Statistiques des incidents
const getIncidentStats = async (req, res) => {
    try {
        let filter = {};
        // ✅ SEULEMENT pour les employés : seulement leurs incidents
        if (req.user && req.user.role === 'employe') {
            filter.reportedBy = req.user._id;
        }
        // ✅ Admin et Technicien voient les stats de tous les incidents
        const stats = await Incident.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const total = await Incident.countDocuments(filter);
        const priorityStats = await Incident.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json({
            totalIncidents: total,
            byStatus: stats,
            byPriority: priorityStats,
            userRole: req.user?.role,
            userId: req.user?._id
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Garder les autres fonctions inchangées
const createIncident = async (req, res) => {
    try {
        const incidentData = {
            ...req.body,
            reportedBy: req.user?._id || null
        };
        const incident = new Incident(incidentData);
        await incident.save();
        const populatedIncident = await Incident.findById(incident._id)
            .populate('equipment', 'name serialNumber')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email');
        res.status(201).json({
            message: 'Incident créé avec succès',
            incident: populatedIncident
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const assignIncident = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        if (!assignedTo) {
            return res.status(400).json({ error: 'L\'utilisateur assigné est requis' });
        }
        const incident = await Incident.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true, runValidators: true }).populate('equipment', 'name serialNumber')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email');
        if (!incident) {
            return res.status(404).json({ error: 'Incident non trouvé' });
        }
        res.json({
            message: 'Incident assigné avec succès',
            incident: incident
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
module.exports = {
    createIncident,
    getIncidents,
    getIncident,
    updateIncident,
    deleteIncident,
    recentIncidents,
    assignIncident,
    getIncidentStats
};
