// routes/rapportRoutes.js
const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour générer les rapports
router.post('/generate', authMiddleware(), generateReport);

// Route de test pour debugger
router.post('/test', (req, res) => {
  res.json({ 
    message: 'Route rapports fonctionnelle!',
    body: req.body 
  });
});

// Route GET pour tester l'accès basique
router.get('/', (req, res) => {
  res.json({ 
    message: 'API Rapports fonctionne',
    endpoints: ['POST /generate', 'POST /test'] 
  });
});

module.exports = router;