const express = require('express');
const router = express.Router();
const {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  deleteIncident,
  recentIncidents,
  assignIncident,
  getIncidentStats
} = require('../controllers/incidentController');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ TOUTES les routes protégées par TON authMiddleware
router.post('/', authMiddleware(), createIncident);
router.get('/', authMiddleware(), getIncidents);
router.get('/recent', authMiddleware(), recentIncidents);
router.get('/stats', authMiddleware(), getIncidentStats);
router.get('/:id', authMiddleware(), getIncident);
router.put('/:id', authMiddleware(), updateIncident);
router.delete('/:id', authMiddleware(), deleteIncident);
router.patch('/:id/assign', authMiddleware(), assignIncident);

module.exports = router;