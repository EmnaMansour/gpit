"use strict";
// const express = require('express');
// const router = express.Router(); 
// const { adminStats, technicienStats, employeStats } = require('../controllers/statsController');
// const { recentIncidents } = require('../controllers/incidentController');
// const authMiddleware = require('../middleware/authMiddleware');
// // Routes protégées avec vérification des rôles spécifiques
// // Route admin seulement
// router.get('/admin/stats', authMiddleware('Admin'), adminStats);
// // Route technicien seulement  
// router.get('/technicien/stats', authMiddleware('Technicien'), technicienStats);
// // Route employé seulement
// router.get('/employe/stats', authMiddleware('Employé'), employeStats);
// // Route pour tous les utilisateurs authentifiés
// router.get('/incidents/recent', authMiddleware(), recentIncidents);
// // Routes alternatives si vous voulez permettre plusieurs rôles
// router.get('/staff/stats', authMiddleware(), (req, res, next) => {
//   // Vérifier si l'utilisateur est admin ou technicien
//   if (!['Admin', 'Technicien'].includes(req.user.role)) {
//     return res.status(403).json({ 
//       message: 'Accès réservé au personnel administratif et technique' 
//     });
//   }
//   next();
// }, (req, res) => {
//   // Retourner les stats appropriées selon le rôle
//   if (req.user.role === 'Admin') {
//     return adminStats(req, res);
//   } else {
//     return technicienStats(req, res);
//   }
// });
// module.exports = router;
