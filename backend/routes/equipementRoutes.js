const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  ajouterEquipement,
  listerEquipements,
  supprimerEquipement,
  mettreAJourEquipement,
  obtenirEquipement
} = require('../controllers/equipementController');


// Lister les équipements (tous les utilisateurs authentifiés - ANY role allowed)
router.get('/', authMiddleware(), listerEquipements);

// Obtenir un équipement spécifique (tous les utilisateurs authentifiés)
router.get('/:id', authMiddleware(), obtenirEquipement);

// Ajouter un équipement (admin et technicien seulement)
router.post('/', authMiddleware('admin', 'technicien'), ajouterEquipement);

// Mettre à jour un équipement (admin et technicien seulement)
router.put('/:id', authMiddleware('admin', 'technicien'), mettreAJourEquipement);

// Supprimer un équipement (admin seulement)
router.delete('/:id', authMiddleware('admin'), supprimerEquipement);

// Route pour récupérer les métriques en temps réel d'un équipement
router.get('/equipements/:id/metrics', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement introuvable' });
    }

    // Option 1 : Récupérer depuis InfluxDB
    const metrics = await getMetricsFromInflux(equipment.ipAddress);
    
    // Option 2 : Récupérer depuis cache Redis
    // const metrics = await redis.get(`metrics:${equipment._id}`);
    
    // Option 3 : Ping direct (moins fiable)
    // const metrics = await pingEquipment(equipment.ipAddress);
    
    res.json({
      cpu: metrics.cpu || 0,
      ram: metrics.ram || 0,
      disk: metrics.disk || 0,
      timestamp: new Date()
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;