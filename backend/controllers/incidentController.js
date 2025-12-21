const Incident = require('../models/Incident');
const User = require('../models/User');

// Fonction de normalisation des rôles (réutilisée depuis equipements)
const normalizeRole = (role) => {
  if (!role) return null;
  const normalized = role.toLowerCase().trim();
  const roleMap = {
    'employee': 'employee',
    'employe': 'employee',
    'employé': 'employee',
    'admin': 'admin',
    'administrator': 'admin',
    'administrateur': 'admin',
    'technicien': 'technician',
    'technician': 'technician',
    'tech': 'technician'
  };
  return roleMap[normalized] || normalized;
};

// Créer un incident
const createIncident = async (req, res) => {
  try {
    const incidentData = {
      ...req.body,
      reportedBy: req.user?._id || null
    };

    const incident = new Incident(incidentData);
    await incident.save();

    const populatedIncident = await Incident.findById(incident._id)
      .populate('equipment', 'nom numeroSerie type') // adapté à ton modèle équipement
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Incident créé avec succès',
      incident: populatedIncident
    });
  } catch (error) {
    console.error('❌ Erreur création incident:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Obtenir tous les incidents
const getIncidents = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user?.role);
    let filter = {};

    console.log('🔍 Récupération incidents - Utilisateur:', {
      userId: req.user?._id,
      role: userRole,
      email: req.user?.email
    });

    // Employés ne voient que leurs propres incidents
    if (userRole === 'employee') {
      filter.reportedBy = req.user._id;
    }
    // Admin et Technicien voient tout → pas de filtre

    const incidents = await Incident.find(filter)
      .populate('equipment', 'nom numeroSerie type')
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    console.log(`📊 ${incidents.length} incidents trouvés pour rôle: ${userRole}`);

    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    console.error('❌ Erreur getIncidents:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir un incident spécifique
const getIncident = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user?.role);
    let filter = { _id: req.params.id };

    if (userRole === 'employee') {
      filter.reportedBy = req.user._id;
    }

    const incident = await Incident.findOne(filter)
      .populate('equipment', 'nom numeroSerie type')
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident non trouvé ou accès refusé'
      });
    }

    res.json({ success: true, data: incident });
  } catch (error) {
    console.error('❌ Erreur getIncident:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Mettre à jour un incident
// Dans updateIncident
const updateIncident = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user?.role);
    let filter = { _id: req.params.id };

    if (userRole === 'employee') {
      filter.reportedBy = req.user._id;
    }

    const incidentExists = await Incident.findOne(filter);
    if (!incidentExists) {
      return res.status(404).json({
        success: false,
        message: 'Incident non trouvé ou accès refusé'
      });
    }

    // 🔥 Si on passe à "Résolu", on enregistre qui l'a fait
    // Dans updateIncident
if (req.body.status === 'Résolu' && incidentExists.status !== 'Résolu') {
  req.body.resolvedBy = req.user._id;        // 🔥 Qui résout
  req.body.resolvedAt = new Date();          // Date de résolution
}

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('equipment', 'nom numeroSerie type')
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role'); // 🔥 Populate le résolveur

    res.json({
      success: true,
      message: 'Incident mis à jour avec succès',
      data: updatedIncident
    });
  } catch (error) {
    console.error('❌ Erreur updateIncident:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Supprimer un incident → SEUL L'ADMIN PEUT SUPPRIMER
const deleteIncident = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user?.role);

    // Seul l'admin peut supprimer
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les administrateurs peuvent supprimer un incident'
      });
    }

    const incident = await Incident.findByIdAndDelete(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Incident supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deleteIncident:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Assigner un incident à un technicien
const assignIncident = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user?.role);

    // Seuls Admin et Technicien peuvent assigner
    if (!['admin', 'technician'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission d\'assigner un incident'
      });
    }

    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du technicien assigné est requis'
      });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true, runValidators: true }
    )
      .populate('equipment', 'nom numeroSerie type')
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!updatedIncident) {
      return res.status(404).json({
        success: false,
        message: 'Incident non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Incident assigné avec succès',
      data: updatedIncident
    });
  } catch (error) {
    console.error('❌ Erreur assignIncident:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Incidents récents (pour dashboard par exemple)
const recentIncidents = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user?.role);
    let filter = {};

    if (userRole === 'employee') {
      filter.reportedBy = req.user._id;
    }

    const incidents = await Incident.find(filter)
      .populate('equipment', 'nom')
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    console.error('❌ Erreur recentIncidents:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Statistiques
const getIncidentStats = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user?.role);
    let filter = {};

    if (userRole === 'employee') {
      filter.reportedBy = req.user._id;
    }

    const stats = await Incident.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityStats = await Incident.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const total = await Incident.countDocuments(filter);

    res.json({
      success: true,
      totalIncidents: total,
      byStatus: stats,
      byPriority: priorityStats
    });
  } catch (error) {
    console.error('❌ Erreur getIncidentStats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  deleteIncident,
  assignIncident,
  recentIncidents,
  getIncidentStats
};