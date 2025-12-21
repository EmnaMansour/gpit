// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Incident = require('../models/Incident');
const Equipement = require('../models/Equipement');
const mongoose = require('mongoose');

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
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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

  } catch (error) {
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
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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

  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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

  } catch (error) {
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
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

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

  } catch (error) {
    console.error('[UPDATE USER] Erreur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
};

// deleteUser corrigé
// deleteUser → Version sécurisée et définitive
const deleteUser = async (req, res) => {
  try {
    const userIdStr = req.params.userId; // ⚠️ Attention : params.userId (pas params.id)
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🗑️  [DELETE USER] Tentative: ${userIdStr}`);
    console.log(`${'='.repeat(70)}`);

    const mongoose = require('mongoose');
    const Incident = require('../models/Incident');
    const Equipement = require('../models/Equipement');
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

    console.log(`✅ User: ${user.name} (${user.email}) - Rôle: ${user.role}`);

    // 🔴 PROTECTION ABSOLUE : LES ADMINS NE PEUVENT JAMAIS ÊTRE SUPPRIMÉS
    if (user.role === 'admin') {
      console.log('🚫 Tentative de suppression d\'un administrateur → REFUSÉE (politique de sécurité)');
      return res.status(403).json({
        success: false,
        message: 'La suppression des comptes administrateurs est strictement interdite pour des raisons de sécurité.'
      });
    }

    // Les vérifications suivantes s'appliquent uniquement aux employés et techniciens

    // 🔍 VÉRIFICATION 1: INCIDENTS
    const incidents = await Incident.find({
      $or: [{ reportedBy: userId }, { assignedTo: userId }]
    });

    if (incidents.length > 0) {
      console.log(`❌ BLOCAGE: ${incidents.length} incident(s) lié(s)`);
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
        .map(a => a.equipementId?.nom || 'Inconnu')
        .filter(Boolean)
        .join(', ');
      
      console.log(`❌ BLOCAGE: ${affectationsActives.length} équipement(s) assigné(s)`);
      
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${affectationsActives.length} équipement(s) assigné(s) (${equipList || 'non spécifiés'})`
      });
    }

    // 🔍 VÉRIFICATION 3: ÉQUIPEMENTS CRÉÉS PAR L'UTILISATEUR
    const equipementsCrees = await Equipement.find({ createdBy: userId });

    if (equipementsCrees.length > 0) {
      console.log(`❌ BLOCAGE: ${equipementsCrees.length} équipement(s) créés par cet utilisateur`);
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${equipementsCrees.length} équipement(s) créé(s) par cet utilisateur`
      });
    }

    // ✅ SUPPRESSION AUTORISÉE (uniquement pour employe / technicien sans dépendances)
    console.log(`✅ SUPPRESSION AUTORISÉE pour l'utilisateur ${user.role}: ${user.name}`);
    await User.findByIdAndDelete(userId);

    console.log(`✅ Utilisateur "${user.name}" supprimé avec succès\n`);

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ [DELETE USER] Erreur inattendue:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Fonction de diagnostic pour débugger les équipements
const debugUserEquipements = async (req, res) => {
  try {
    const userIdStr = req.params.id;
    console.log(`\n🔍 [DEBUG] Analyse pour utilisateur: ${userIdStr}`);

    if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
      return res.json({ error: 'ID invalide' });
    }

    const userId = new mongoose.Types.ObjectId(userIdStr);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.json({ error: 'Utilisateur non trouvé' });
    }

    // Rechercher TOUS les équipements
    const allEquipements = await Equipement.find({});
    console.log(`📦 Total équipements dans la BD: ${allEquipements.length}`);

    // Analyser chaque équipement
    const equipementsTrouves = [];
    
    for (const equip of allEquipements) {
      const raisons = [];
      
      // Test assignedTo
      if (equip.assignedTo) {
        const assignedToStr = equip.assignedTo.toString();
        console.log(`\n🔎 Équipement "${equip.nom}":`);
        console.log(`   assignedTo: ${assignedToStr}`);
        console.log(`   userId: ${userIdStr}`);
        console.log(`   Match? ${assignedToStr === userIdStr}`);
        
        if (assignedToStr === userIdStr) {
          raisons.push(`assignedTo: ${assignedToStr}`);
        }
      }
      
      // Test affectations array
      if (equip.affectations && equip.affectations.length > 0) {
        equip.affectations.forEach((aff, idx) => {
          if (aff.assignedTo) {
            const affStr = aff.assignedTo.toString();
            if (affStr === userIdStr) {
              raisons.push(`affectations[${idx}]: ${affStr}`);
            }
          }
        });
      }
      
      if (raisons.length > 0) {
        equipementsTrouves.push({
          nom: equip.nom,
          id: equip._id,
          raisons
        });
      }
    }

    res.json({
      utilisateur: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      totalEquipements: allEquipements.length,
      equipementsTrouves,
      peutSupprimer: equipementsTrouves.length === 0,
      message: equipementsTrouves.length > 0 
        ? `❌ ${equipementsTrouves.length} équipement(s) lié(s) - SUPPRESSION BLOQUÉE`
        : '✅ Aucun équipement lié - SUPPRESSION AUTORISÉE'
    });

  } catch (error) {
    console.error('❌ [DEBUG] Erreur:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getUsers,
  getUser,
  createUser,
  updateUser,
  debugUserEquipements,
  deleteUser
};