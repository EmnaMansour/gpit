const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// ==================== FONCTIONS HELPER ====================

/**
 * Valider les données d'entrée du login
 */
const validateLoginInput = (email, password) => {
  if (!email || !password) {
    return {
      valid: false,
      error: 'Email et mot de passe requis'
    };
  }
  return { valid: true };
};

/**
 * Rechercher l'utilisateur dans la base de données
 */
const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return { found: false };
    }
    
    console.log(`🔍 Utilisateur trouvé: ${user.email} (status: ${user.status})`);
    return { found: true, user };
  } catch (error) {
    console.error('💥 ERREUR DATABASE:', error);
    return { found: false, error };
  }
};

/**
 * Vérifier le mot de passe
 */
const verifyPassword = async (user, password) => {
  try {
    const isValid = await user.comparePassword(password);
    console.log('🔍 Résultat vérification mot de passe:', isValid);
    return { valid: isValid };
  } catch (bcryptError) {
    console.error('💥 ERREUR BCRYPT:', bcryptError);
    return { valid: false, error: bcryptError };
  }
};

/**
 * Gérer l'auto-approbation si nécessaire
 */
const autoApproveIfPending = async (user) => {
  if (user.status === 'pending') {
    console.log('🔄 Auto-approbation de l\'utilisateur pending...');
    try {
      user.status = 'active';
      user.approvedAt = new Date();
      await user.save();
      console.log('✅ Utilisateur auto-approuvé avec succès');
    } catch (error) {
      console.error('💥 Erreur auto-approbation:', error);
    }
  }
  return user;
};

/**
 * Vérifier le statut de l'utilisateur
 */
const checkUserStatus = (user) => {
  if (user.status !== 'active') {
    console.log('❌ Statut non autorisé:', user.status);
    return {
      authorized: false,
      message: `Votre compte est ${user.status}. Contactez l'administrateur.`,
      status: user.status
    };
  }
  return { authorized: true };
};

/**
 * Générer le token JWT
 */
const generateJWTToken = (user) => {
  try {
    const jwtPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(
      jwtPayload,
      jwtSecret || 'dev_secret_fallback_12345',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Token généré avec succès');
    return { token };
  } catch (error) {
    console.error('💥 ERREUR JWT:', error);
    return { token: null, error };
  }
};

/**
 * Mettre à jour la dernière connexion
 */
const updateLastLogin = async (user) => {
  try {
    user.lastLogin = new Date();
    await user.save();
    console.log('✅ LastLogin mis à jour');
  } catch (error) {
    console.warn('⚠️ Erreur sauvegarde lastLogin:', error);
  }
};

/**
 * Formater la réponse utilisateur
 */
const formatUserResponse = (user) => {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    department: user.department,
    phone: user.phone,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };
};

// ==================== CONTROLERS PRINCIPAUX ====================

/**
 * 🔐 INSCRIPTION UTILISATEUR
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, phone, department } = req.body;

    console.log('📝 Nouvelle inscription:', { name, email, role });

    // Validation des champs requis
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Le nom, l\'email et le mot de passe sont requis' 
      });
    }

    // Validation confirmation mot de passe
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Les mots de passe ne correspondent pas' 
      });
    }

    // Validation longueur mot de passe
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Créer le token de confirmation
    const confirmToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Créer le nouvel utilisateur
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      phone: phone ? phone.trim() : undefined,
      department: department ? department.trim() : undefined,
      role: role || 'employe',
      status: 'pending',
      confirmationToken: confirmToken,
      confirmationTokenExpiry: tokenExpiry
    });

    await newUser.save();

    console.log(`✅ Nouvel utilisateur inscrit: ${email} (statut: ${newUser.status})`);

    // 🔥 ENVOI DES EMAILS
    try {
      // 1. Email de confirmation à l'utilisateur
      await emailService.sendConfirmationEmail(newUser.email, newUser.name, confirmToken);
      console.log('📧 Email de confirmation envoyé à l\'utilisateur');

      // 2. Notification à l'admin avec boutons d'action
      await emailService.sendAdminNotification({
        userId: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        department: newUser.department
      });
      console.log('📧 Notification admin envoyée avec boutons d\'action');

    } catch (emailError) {
      console.warn('⚠️ Erreur envoi emails:', emailError.message);
      // Continuer même si les emails échouent
    }

    res.status(201).json({
      success: true,
      message: 'Inscription réussie! Votre compte attend l\'approbation d\'un administrateur.',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
        department: newUser.department,
        phone: newUser.phone
      }
    });

  } catch (error) {
    console.error('❌ Erreur inscription utilisateur:', error);
    
    // Gestion des erreurs de duplication MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🔐 CONNEXION UTILISATEUR
 */
const loginUser = async (req, res) => {
  console.log('🔍 === DÉBUT REQUÊTE LOGIN ===');
  
  try {
    const { email, password } = req.body;

    // ÉTAPE 1: Valider l'entrée
    const validation = validateLoginInput(email, password);
    if (!validation.valid) {
      console.log('❌ Validation échouée:', validation.error);
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // ÉTAPE 2: Rechercher l'utilisateur
    console.log('🔍 Étape 2: Recherche utilisateur...');
    const userSearch = await findUserByEmail(email);
    if (!userSearch.found) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }
    let user = userSearch.user;

    // ÉTAPE 3: Vérifier le mot de passe
    console.log('🔍 Étape 3: Vérification du mot de passe...');
    const passwordCheck = await verifyPassword(user, password);
    if (!passwordCheck.valid) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // ÉTAPE 4: Auto-approbation si pending
    console.log('🔍 Étape 4: Vérification du statut...');
    user = await autoApproveIfPending(user);

    // ÉTAPE 5: Vérifier que l'utilisateur est actif
    const statusCheck = checkUserStatus(user);
    if (!statusCheck.authorized) {
      return res.status(403).json({ 
        success: false,
        message: statusCheck.message,
        status: statusCheck.status
      });
    }

    // ÉTAPE 6: Générer le token JWT
    console.log('🔍 Étape 6: Génération du token JWT...');
    const tokenResult = generateJWTToken(user);
    if (!tokenResult.token) {
      return res.status(500).json({
        success: false,
        message: 'Erreur de génération du token',
        error: process.env.NODE_ENV === 'development' ? tokenResult.error.message : undefined
      });
    }

    // ÉTAPE 7: Mettre à jour dernière connexion
    console.log('🔍 Étape 7: Mise à jour lastLogin...');
    await updateLastLogin(user);

    // SUCCÈS
    console.log('🎉 === LOGIN RÉUSSI ===');
    res.json({
      success: true,
      message: 'Connexion réussie',
      token: tokenResult.token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('💥💥💥 ERREUR GLOBALE NON ATTENDUE:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur technique lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      } : undefined
    });
  } finally {
    console.log('🔍 === FIN REQUÊTE LOGIN ===');
  }
};

/**
 * ✅ APPROBATION UTILISATEUR (Admin)
 */
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approvedByAdminId, reason } = req.body;

    console.log(`✅ Approbation demandée pour l'utilisateur: ${userId}`);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Seuls les comptes en attente peuvent être approuvés' 
      });
    }

    // Mettre à jour le statut
    user.status = 'active';
    user.approvedBy = approvedByAdminId;
    user.approvedAt = new Date();
    user.confirmationToken = undefined;
    user.confirmationTokenExpiry = undefined;

    await user.save();

    // Envoyer email d'activation
    try {
      await emailService.sendActivationEmail(user.email, user.name);
      console.log(`📧 Email d'activation envoyé à: ${user.email}`);
    } catch (emailError) {
      console.warn('⚠️ Email d\'activation non envoyé:', emailError.message);
    }

    console.log(`✅ Utilisateur approuvé: ${user.email} par admin: ${approvedByAdminId}`);

    res.json({
      success: true,
      message: 'Utilisateur approuvé avec succès',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
        approvedAt: user.approvedAt,
        approvedBy: user.approvedBy
      }
    });

  } catch (error) {
    console.error('❌ Erreur approbation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de l\'approbation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * ❌ REJET UTILISATEUR (Admin)
 */
const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, rejectedByAdminId } = req.body;

    console.log(`❌ Rejet demandé pour l'utilisateur: ${userId}`);

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'La raison du rejet est requise'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Seuls les comptes en attente peuvent être rejetés' 
      });
    }

    // Mettre à jour le statut
    user.status = 'rejected';
    user.rejectionReason = reason;
    user.approvedBy = rejectedByAdminId;
    user.confirmationToken = undefined;
    user.confirmationTokenExpiry = undefined;

    await user.save();

    // Envoyer email de rejet
    try {
      await emailService.sendRejectedEmail(user.email, user.name, reason);
      console.log(`📧 Email de rejet envoyé à: ${user.email}`);
    } catch (emailError) {
      console.warn('⚠️ Email de rejet non envoyé:', emailError.message);
    }

    console.log(`❌ Utilisateur rejeté: ${user.email} - Raison: ${reason}`);

    res.json({
      success: true,
      message: 'Utilisateur rejeté',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
        rejectionReason: reason
      }
    });

  } catch (error) {
    console.error('❌ Erreur rejet:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors du rejet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 📋 LISTER TOUS LES UTILISATEURS
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -confirmationToken')
      .sort({ createdAt: -1 });

    console.log(`📋 Récupération de ${users.length} utilisateurs`);

    res.json({
      success: true,
      total: users.length,
      users
    });

  } catch (error) {
    console.error('❌ Erreur liste utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 📋 LISTER UTILISATEURS EN ATTENTE
 */
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password -confirmationToken')
      .sort({ createdAt: -1 });

    console.log(`📋 ${pendingUsers.length} utilisateurs en attente d'approbation`);

    res.json({
      success: true,
      total: pendingUsers.length,
      users: pendingUsers
    });

  } catch (error) {
    console.error('❌ Erreur liste utilisateurs en attente:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs en attente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 👤 RÉCUPÉRER UN UTILISATEUR PAR ID
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -confirmationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 📧 VÉRIFIER STATUT UTILISATEUR PAR EMAIL
 */
const getUserStatusByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email })
      .select('-password -confirmationToken');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        status: user.status,
        role: user.role,
        department: user.department,
        phone: user.phone,
        active: user.status === 'active',
        rejected: user.status === 'rejected',
        pending: user.status === 'pending',
        createdAt: user.createdAt,
        approvedAt: user.approvedAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification statut:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la vérification du statut',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * ✏️ METTRE À JOUR LE PROFIL UTILISATEUR
 */
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, department } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          name: name,
          phone: phone,
          department: department,
          updatedAt: new Date()
        } 
      },
      { new: true }
    ).select('-password -confirmationToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    console.log(`✏️ Profil mis à jour pour: ${user.email}`);

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userIdStr = req.params.userId; // ⚠️ Attention : params.userId (pas params.id)
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🗑️  [DELETE USER] Tentative: ${userIdStr}`);
    console.log(`${'='.repeat(70)}`);

    const mongoose = require('mongoose');
    const Incident = require('../models/Incident');      // ✅ CORRIGÉ
    const Equipement = require('../models/Equipement');  // ✅ CORRIGÉ
    const Affectation = require('../models/Affectation');

    // Validation ID
    if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID invalide' 
      });
    }

    const userId = new mongoose.Types.ObjectId(userIdStr);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    console.log(`✅ User: ${user.name} (${user.email})`);

    // 🔍 VÉRIFICATION 1: INCIDENTS
    const incidents = await Incident.find({
      $or: [{ reportedBy: userId }, { assignedTo: userId }]
    });

    if (incidents.length > 0) {
      console.log(`❌ BLOCAGE: ${incidents.length} incident(s)`);
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${incidents.length} incident(s) lié(s)`
      });
    }

    // 🔍 VÉRIFICATION 2: AFFECTATIONS ACTIVES
    const affectationsActives = await Affectation.find({
      employeId: userId,
      $or: [
        { dateRetour: { $exists: false } },
        { dateRetour: null }
      ]
    }).populate('equipementId', 'nom type');

    if (affectationsActives.length > 0) {
      const equipList = affectationsActives
        .map(a => a.equipementId?.nom)
        .join(', ');
      
      console.log(`❌ BLOCAGE: ${affectationsActives.length} équipement(s)`);
      
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${affectationsActives.length} équipement(s) assigné(s) (${equipList})`
      });
    }

    // 🔍 VÉRIFICATION 3: ÉQUIPEMENTS CRÉÉS
    const equipementsCrees = await Equipement.find({ createdBy: userId });

    if (equipementsCrees.length > 0) {
      console.log(`❌ BLOCAGE: ${equipementsCrees.length} équipement(s) créés`);
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${equipementsCrees.length} équipement(s) créé(s)`
      });
    }

    // ✅ VÉRIFICATION DERNIER ADMIN
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier admin'
        });
      }
    }

    // ✅ SUPPRESSION
    console.log(`✅ SUPPRESSION AUTORISÉE`);
    await User.findByIdAndDelete(userId);

    console.log(`✅ User "${user.name}" supprimé\n`);

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ [DELETE] Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * 🔑 CHANGER LE MOT DE PASSE
 */
const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    console.log(`🔑 Mot de passe changé pour: ${user.email}`);

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du changement de mot de passe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================== FONCTIONS DE DÉPANNAGE ====================

/**
 * 🛠️ APPROUVER AUTOMATIQUEMENT TOUS LES UTILISATEURS EN ATTENTE
 */
const autoApproveAllPending = async (req, res) => {
  try {
    const result = await User.updateMany(
      { status: 'pending' },
      { 
        $set: { 
          status: 'active',
          approvedAt: new Date(),
          approvedBy: null
        },
        $unset: {
          confirmationToken: "",
          confirmationTokenExpiry: ""
        }
      }
    );

    console.log(`✅ ${result.modifiedCount} utilisateurs approuvés automatiquement`);
    res.json({
      success: true,
      message: `${result.modifiedCount} utilisateurs approuvés automatiquement`,
      approvedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Erreur auto-approval:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation automatique',
      error: error.message
    });
  }
};

/**
 * 🛠️ APPROUVER PAR EMAIL (Dépannage)
 */
const approveUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await User.findOneAndUpdate(
      { email: email },
      { 
        $set: { 
          status: 'active',
          approvedAt: new Date()
        },
        $unset: {
          confirmationToken: "",
          confirmationTokenExpiry: ""
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    console.log(`✅ Utilisateur ${email} approuvé avec succès`);
    res.json({
      success: true,
      message: `Utilisateur ${email} approuvé avec succès`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Erreur approbation par email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation',
      error: error.message
    });
  }
};

/**
 * 🛠️ CRÉER UTILISATEUR APPROUVÉ (Dépannage)
 */
const createApprovedUser = async (req, res) => {
  try {
    const { email, password, name, role, phone, department } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, mot de passe et nom requis'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà utilisé'
      });
    }

    const newUser = new User({
      name: name,
      email: email,
      password: password,
      phone: phone,
      department: department,
      role: role || 'employe',
      status: 'active',
      approvedAt: new Date()
    });

    await newUser.save();
    console.log(`✅ Utilisateur approuvé créé: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé et approuvé automatiquement',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
        department: newUser.department
      }
    });
  } catch (error) {
    console.error('❌ Erreur création utilisateur approuvé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur création utilisateur',
      error: error.message
    });
  }
};

/**
 * 🛠️ DEBUG TOUS LES UTILISATEURS
 */
const debugAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('email name status role createdAt approvedAt department phone');
    
    const stats = {
      total: users.length,
      pending: users.filter(u => u.status === 'pending').length,
      active: users.filter(u => u.status === 'active').length,
      rejected: users.filter(u => u.status === 'rejected').length
    };

    res.json({
      success: true,
      stats: stats,
      users: users
    });
  } catch (error) {
    console.error('❌ Erreur debug users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// ==================== EXPORT ====================

module.exports = {
  // Contrôleurs principaux
  registerUser,
  loginUser,
  approveUser,
  rejectUser,
  getAllUsers,
  getPendingUsers,
  getUserById,
  getUserStatusByEmail,
  updateUserProfile,
  changePassword,
  deleteUser,
  
  // Fonctions de dépannage
  autoApproveAllPending,
  approveUserByEmail,
  createApprovedUser,
  debugAllUsers
};