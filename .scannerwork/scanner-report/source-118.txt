const express = require('express');
const router = express.Router();
const Equipement = require('../models/Equipement');
const Incident = require('../models/Incident');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// ==================== DASHBOARD PRINCIPAL ====================
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    const userId = req.user._id;

    // Filtrage selon le rôle
    const equipmentFilter = userRole === 'admin' ? {} : { createdBy: userId };
    const incidentFilter = userRole === 'admin' ? {} : { createdBy: userId };

    // Statistiques équipements par statut
    const equipmentStatsAgg = await Equipement.aggregate([
      { $match: equipmentFilter },
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    const equipmentStats = {
      total: 0,
      disponible: 0,
      assigne: 0,
      enPanne: 0,
      enMaintenance: 0,
      reserve: 0
    };

    equipmentStatsAgg.forEach(stat => {
      switch (stat._id) {
        case 'Disponible': equipmentStats.disponible = stat.count; break;
        case 'Assigné': equipmentStats.assigne = stat.count; break;
        case 'En panne': equipmentStats.enPanne = stat.count; break;
        case 'En maintenance': equipmentStats.enMaintenance = stat.count; break;
        case 'Réservé': equipmentStats.reserve = stat.count; break;
      }
      equipmentStats.total += stat.count;
    });

    // Statistiques incidents
    const incidentsCountAgg = await Incident.aggregate([
      { $match: incidentFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    let activeIncidents = 0;
    let resolvedIncidents = 0;
    incidentsCountAgg.forEach(stat => {
      if (stat._id === 'En cours') activeIncidents = stat.count;
      if (stat._id === 'Résolu') resolvedIncidents = stat.count;
    });

    // Équipements récents
    const recentEquipments = await Equipement.find(equipmentFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nom type statut dateAchat')
      .lean();

    // Incidents récents
    const recentIncidents = await Incident.find(incidentFilter)
      .sort({ date: -1 })
      .limit(3)
      .select('title status priority date assignedTo')
      .lean();

    // Total utilisateurs (Admin seulement)
    const totalUsers = userRole === 'admin' ? await User.countDocuments() : undefined;

    res.json({
      success: true,
      data: {
        userInfo: {
          name: req.user.name,
          role: userRole,
          isAdmin: userRole === 'admin'
        },
        stats: {
          totalEquipment: equipmentStats.total,
          activeIncidents,
          resolvedIncidents,
          ...(userRole === 'admin' && { totalUsers })
        },
        equipmentStats,
        equipmentStatus: [
          { status: 'Disponible', count: equipmentStats.disponible, color: 'green' },
          { status: 'Assigné', count: equipmentStats.assigne, color: 'blue' },
          { status: 'En panne', count: equipmentStats.enPanne, color: 'red' },
          { status: 'En maintenance', count: equipmentStats.enMaintenance, color: 'yellow' },
          { status: 'Réservé', count: equipmentStats.reserve, color: 'purple' }
        ],
        recentEquipments,
        recentIncidents
      }
    });

  } catch (err) {
    console.error('❌ Erreur dashboard:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du chargement du dashboard',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ==================== STATISTIQUES ADMIN ====================
router.get('/admin-stats', authMiddleware('Admin'), async (req, res) => {
  try {
    const allUsers = await User.find().select('name email role createdAt').lean();

    const usersByRole = await User.aggregate([
      { $group: { _id: { $toLower: '$role' }, count: { $sum: 1 } } }
    ]);

    const equipmentsByUser = await Equipement.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'owner'
        }
      },
      { $unwind: '$owner' },
      {
        $group: {
          _id: '$owner._id',
          ownerName: { $first: '$owner.name' },
          ownerRole: { $first: '$owner.role' },
          equipmentCount: { $sum: 1 }
        }
      },
      { $sort: { equipmentCount: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        allUsers,
        usersByRole,
        equipmentsByUser
      }
    });
  } catch (err) {
    console.error('❌ Erreur statistiques admin:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ==================== PROFIL UTILISATEUR ====================
router.get('/profile', authMiddleware(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    const equipmentCount = await Equipement.countDocuments({ createdBy: req.user._id });

    res.json({
      success: true,
      data: {
        user,
        equipmentCount
      }
    });
  } catch (err) {
    console.error('❌ Erreur profil:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
