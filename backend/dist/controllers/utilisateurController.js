"use strict";
// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_jwt';
// Connexion utilisateur
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('[LOGIN] Tentative de connexion pour:', email);
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email et mot de passe requis'
            });
        }
        // Trouver l'utilisateur
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Email ou mot de passe incorrect'
            });
        }
        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                error: 'Email ou mot de passe incorrect'
            });
        }
        // Vérifier si l'utilisateur est actif
        if (!user.isActive) {
            return res.status(400).json({
                success: false,
                error: 'Compte désactivé'
            });
        }
        // Mettre à jour lastLogin
        user.lastLogin = new Date();
        await user.save();
        // Générer le token JWT
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name
        }, JWT_SECRET, { expiresIn: '24h' });
        // Réponse réussie
        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });
    }
    catch (error) {
        console.error('[LOGIN] Erreur:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la connexion'
        });
    }
};
// Inscription utilisateur
const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;
        console.log('[REGISTER] Tentative d\'inscription:', { name, email, role });
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Tous les champs sont requis'
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Les mots de passe ne correspondent pas'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Le mot de passe doit contenir au moins 6 caractères'
            });
        }
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Un utilisateur avec cet email existe déjà'
            });
        }
        // Créer le nouvel utilisateur
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'employee'
        });
        await newUser.save();
        // Générer le token
        const token = jwt.sign({
            id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name
        }, JWT_SECRET, { expiresIn: '24h' });
        // Réponse réussie
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        });
    }
    catch (error) {
        console.error('[REGISTER] Erreur:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de l\'inscription'
        });
    }
};
// Obtenir tous les utilisateurs
const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ name: 1 });
        res.json({
            success: true,
            users: users || [],
            count: users.length
        });
    }
    catch (error) {
        console.error('[GET USERS] Erreur:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des utilisateurs',
            users: []
        });
    }
};
// Obtenir un utilisateur spécifique
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }
        res.json({
            success: true,
            user: user
        });
    }
    catch (error) {
        console.error('[GET USER] Erreur:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement de l\'utilisateur'
        });
    }
};
// Créer un utilisateur
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;
        console.log('[CREATE USER] Données reçues:', { name, email, role });
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Le nom, l\'email et le mot de passe sont requis'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Le mot de passe doit contenir au moins 6 caractères'
            });
        }
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Un utilisateur avec cet email existe déjà'
            });
        }
        // Créer le nouvel utilisateur
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'employee',
            department: department || ''
        });
        await newUser.save();
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                department: newUser.department,
                createdAt: newUser.createdAt
            }
        });
    }
    catch (error) {
        console.error('[CREATE USER] Erreur:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de l\'utilisateur'
        });
    }
};
// Modifier un utilisateur
const updateUser = async (req, res) => {
    try {
        const { name, email, role, department, isActive } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email.toLowerCase();
        if (role)
            updateData.role = role;
        if (department !== undefined)
            updateData.department = department;
        if (typeof isActive !== 'undefined')
            updateData.isActive = isActive;
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'Utilisateur mis à jour avec succès',
            user: user
        });
    }
    catch (error) {
        console.error('[UPDATE USER] Erreur:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour de l\'utilisateur'
        });
    }
};
// Supprimer un utilisateur
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    }
    catch (error) {
        console.error('[DELETE USER] Erreur:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de l\'utilisateur'
        });
    }
};
module.exports = {
    loginUser,
    registerUser,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};
