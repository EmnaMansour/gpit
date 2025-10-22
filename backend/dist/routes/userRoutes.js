"use strict";
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// Routes principales
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/all', userController.getAllUsers);
router.get('/pending', userController.getPendingUsers);
router.get('/:userId', userController.getUserById);
router.get('/status/:email', userController.getUserStatusByEmail);
router.put('/profile/:userId', userController.updateUserProfile);
router.delete('/:userId', userController.deleteUser); // DELETE /api/users/:userId
router.put('/change-password/:userId', userController.changePassword);
// Routes admin
router.post('/approve/:userId', userController.approveUser);
router.post('/reject/:userId', userController.rejectUser);
// Routes de dépannage
router.post('/auto-approve-all', userController.autoApproveAllPending);
router.post('/approve-by-email', userController.approveUserByEmail);
router.post('/create-approved-user', userController.createApprovedUser);
router.get('/debug/all', userController.debugAllUsers);
// Route santé
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'User service is running',
        timestamp: new Date().toISOString()
    });
});
module.exports = router;
