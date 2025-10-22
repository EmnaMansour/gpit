"use strict";
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
// Middleware de logging
router.use((req, res, next) => {
    console.log(`📞 ${req.method} ${req.path}`, req.body);
    next();
});
// Routes principales
router.post('/', contactController.createContact);
router.get('/', contactController.getAllContacts);
router.get('/pending', contactController.getPendingContacts);
router.patch('/:id/read', contactController.markAsRead);
router.delete('/:id', contactController.deleteContact);
module.exports = router;
