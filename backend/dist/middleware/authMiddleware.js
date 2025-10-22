"use strict";
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            console.log('[AUTH] Middleware appelé avec rôles autorisés:', allowedRoles);
            const token = req.header('Authorization')?.replace('Bearer ', '');
            console.log('[AUTH] Token reçu:', token ? 'Présent' : 'Absent');
            if (!token) {
                console.log('[AUTH] Token manquant');
                return res.status(401).json({ message: 'Token manquant, accès refusé' });
            }
            // ✅ CORRECTION : Utilisez la MÊME clé que dans votre route de login
            const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_fallback_12345';
            console.log('[AUTH] Clé JWT utilisée:', JWT_SECRET.substring(0, 10) + '...');
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('[AUTH] Token décodé, ID utilisateur:', decoded.id);
            console.log('[AUTH] DECODED TOKEN COMPLET:', JSON.stringify(decoded, null, 2));
            const user = await User.findById(decoded.id);
            if (!user) {
                console.log('[AUTH] Utilisateur non trouvé dans la base');
                return res.status(401).json({ message: 'Utilisateur non trouvé' });
            }
            console.log('[AUTH] Utilisateur trouvé:', {
                id: user._id,
                role: user.role,
                email: user.email,
                status: user.status
            });
            // ✅ DEBUG: Check user status FIRST
            console.log('[AUTH] Vérification du statut:', {
                userStatus: user.status,
                isActive: user.status === 'active',
                statusCheck: user.status !== 'active'
            });
            // Vérifier que l'utilisateur est actif
            // Note: En production, gardez cette vérification stricte
            // En développement, vous pouvez autoriser 'pending' en ajoutant: || user.status === 'pending'
            const isDevEnvironment = process.env.NODE_ENV === 'development';
            const allowedStatuses = isDevEnvironment ? ['active', 'pending'] : ['active'];
            if (!allowedStatuses.includes(user.status)) {
                console.log('[AUTH] ❌ Utilisateur non actif:', user.status);
                return res.status(403).json({
                    message: `Compte ${user.status} - Contactez l'administrateur`
                });
            }
            console.log('[AUTH] ✅ Statut utilisateur valide: active');
            // ✅ NORMALISATION DES RÔLES
            if (allowedRoles.length > 0) {
                console.log('[AUTH] Vérification des rôles...');
                const normalizedUserRole = (user.role || '').toLowerCase().trim();
                const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());
                console.log('[AUTH] Rôles normalisés:', {
                    userRole: normalizedUserRole,
                    allowedRoles: normalizedAllowedRoles,
                    isIncluded: normalizedAllowedRoles.includes(normalizedUserRole)
                });
                if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
                    console.log('[AUTH] ❌ Rôle insuffisant:', {
                        userRole: normalizedUserRole,
                        allowedRoles: normalizedAllowedRoles
                    });
                    return res.status(403).json({
                        message: 'Accès interdit - rôle insuffisant',
                        userRole: user.role,
                        requiredRoles: allowedRoles
                    });
                }
                console.log('[AUTH] ✅ Rôle autorisé');
            }
            else {
                console.log('[AUTH] ✅ Aucune restriction de rôle - tous les utilisateurs authentifiés sont autorisés');
            }
            console.log('[AUTH] ✅ Authentification réussie pour:', user.email);
            req.user = user;
            next();
        }
        catch (error) {
            console.error('[AUTH] ❌ Erreur d\'authentification:', error.message);
            console.error('[AUTH] Stack trace:', error.stack);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expiré' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token invalide' });
            }
            res.status(401).json({ message: 'Erreur d\'authentification', error: error.message });
        }
    };
};
module.exports = authMiddleware;
