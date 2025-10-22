"use strict";
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { ajouterEquipement, listerEquipements, supprimerEquipement, mettreAJourEquipement, obtenirEquipement } = require('../controllers/equipementController');
// IMPORTANT: The middleware signature should be:
// authMiddleware() for "any authenticated user"
// authMiddleware('admin') for specific roles
// authMiddleware('admin', 'technicien') for multiple roles
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
module.exports = router;
