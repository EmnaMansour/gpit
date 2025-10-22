const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

let Admin;
try {
  Admin = require('../models/Admin');
} catch (e) {
  console.warn('⚠️ Modèle Admin non trouvé, création d\'un stub');
  Admin = null;
}

let emailService;
try {
  emailService = require('../services/emailService');
} catch (e) {
  console.warn('⚠️ Service Email non trouvé, utilisation d\'un stub');
  emailService = null;
}

const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// Stub pour emailService si non disponible
const stubEmailService = {
  sendConfirmationEmail: async () => { console.log('📧 Email de confirmation (stub)'); },
  sendApprovedEmail: async () => { console.log('📧 Email d\'approbation (stub)'); },
  sendRejectedEmail: async () => { console.log('📧 Email de rejet (stub)'); }
};

const email = emailService || stubEmailService;

/**
 * 1️⃣ ENREGISTREMENT ADMIN
 * POST /api/admin/register
 */
router.post('/register', async (req, res) => {
  try {
    if (!Admin) {
      return res.status(500).json({ 
        success: false,
        message: 'Modèle Admin non disponible' 
      });
    }

    const { name, email: adminEmail, password, phone } = req.body;

    if (!name || !adminEmail || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis (name, email, password)' 
      });
    }

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    const confirmToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newAdmin = new Admin({
      name,
      email: adminEmail,
      password,
      phone,
      status: 'en_attente',
      confirmationToken: confirmToken,
      confirmationTokenExpiry: tokenExpiry
    });

    await newAdmin.save();

    await email.sendConfirmationEmail(adminEmail, name, confirmToken);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie! Un email de confirmation a été envoyé.',
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        name: newAdmin.name,
        status: newAdmin.status
      }
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message 
    });
  }
});

/**
 * 2️⃣ VÉRIFIER LE STATUT DE CONFIRMATION
 * GET /api/admin/status/:email
 */
router.get('/status/:email', async (req, res) => {
  try {
    if (!Admin) {
      return res.status(500).json({ 
        success: false,
        message: 'Modèle Admin non disponible' 
      });
    }

    const admin = await Admin.findOne({ email: req.params.email });

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin non trouvé' 
      });
    }

    res.json({
      success: true,
      admin: {
        email: admin.email,
        name: admin.name,
        status: admin.status,
        confirmed: admin.status === 'confirmé',
        rejected: admin.status === 'rejeté',
        pending: admin.status === 'en_attente',
        createdAt: admin.createdAt,
        confirmationDate: admin.confirmationDate
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

/**
 * 3️⃣ CONFIRMER LE COMPTE
 * POST /api/admin/confirm/:token
 */
router.post('/confirm/:token', async (req, res) => {
  try {
    if (!Admin) {
      return res.status(500).json({ 
        success: false,
        message: 'Modèle Admin non disponible' 
      });
    }

    const { token } = req.params;

    const admin = await Admin.findOne({ 
      confirmationToken: token,
      confirmationTokenExpiry: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ 
        success: false,
        message: 'Token invalide ou expiré. Veuillez vous réinscrire.' 
      });
    }

    if (admin.status === 'confirmé') {
      return res.status(400).json({ 
        success: false,
        message: 'Ce compte est déjà confirmé' 
      });
    }

    admin.status = 'confirmé';
    admin.confirmationDate = new Date();
    admin.confirmationToken = null;
    admin.confirmationTokenExpiry = null;

    await admin.save();

    await email.sendApprovedEmail(admin.email, admin.name);

    res.json({
      success: true,
      message: 'Compte confirmé avec succès!',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        status: admin.status
      }
    });

  } catch (error) {
    console.error('❌ Erreur confirmation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

/**
 * 4️⃣ REJETER LE COMPTE
 * POST /api/admin/reject/:adminId
 */
router.post('/reject/:adminId', async (req, res) => {
  try {
    if (!Admin) {
      return res.status(500).json({ 
        success: false,
        message: 'Modèle Admin non disponible' 
      });
    }

    const { adminId } = req.params;
    const { reason } = req.body;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin non trouvé' 
      });
    }

    if (admin.status !== 'en_attente') {
      return res.status(400).json({ 
        success: false,
        message: 'Seuls les comptes en attente peuvent être rejetés' 
      });
    }

    admin.status = 'rejeté';
    admin.confirmationToken = null;
    admin.confirmationTokenExpiry = null;

    await admin.save();

    await email.sendRejectedEmail(admin.email, admin.name, reason);

    res.json({
      success: true,
      message: 'Compte rejeté et email envoyé',
      admin: {
        id: admin._id,
        email: admin.email,
        status: admin.status
      }
    });

  } catch (error) {
    console.error('❌ Erreur rejet:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

/**
 * 5️⃣ LISTER LES ADMINS EN ATTENTE
 * GET /api/admin/pending
 */
router.get('/pending', async (req, res) => {
  try {
    if (!Admin) {
      return res.status(500).json({ 
        success: false,
        message: 'Modèle Admin non disponible' 
      });
    }

    const pendingAdmins = await Admin.find({ status: 'en_attente' })
      .select('-password -confirmationToken');

    res.json({
      success: true,
      total: pendingAdmins.length,
      admins: pendingAdmins
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

/**
 * 6️⃣ LOGIN
 * POST /api/admin/login
 */
router.post('/login', async (req, res) => {
  try {
    if (!Admin) {
      return res.status(500).json({ 
        success: false,
        message: 'Modèle Admin non disponible' 
      });
    }

    const { email: adminEmail, password } = req.body;

    if (!adminEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et password requis'
      });
    }

    const admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }

    if (admin.status !== 'confirmé') {
      return res.status(403).json({ 
        success: false,
        message: `Votre compte est ${admin.status}. Attendez la confirmation.`,
        status: admin.status
      });
    }

    const isValid = await admin.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

/**
 * 7️⃣ PROFIL DE L'ADMIN CONNECTÉ
 * GET /api/admin/me
 */
router.get('/me', async (req, res) => {
  try {
    if (!Admin || !req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    const admin = await Admin.findById(req.user.id).select('-password -confirmationToken');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin non trouvé'
      });
    }

    res.json({
      success: true,
      admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

/**
 * 8️⃣ LISTER TOUS LES ADMINS
 * GET /api/admin/list
 */
router.get('/list', async (req, res) => {
  try {
    if (!Admin) {
      return res.status(500).json({ 
        success: false,
        message: 'Modèle Admin non disponible' 
      });
    }

    const admins = await Admin.find().select('-password -confirmationToken');

    res.json({
      success: true,
      total: admins.length,
      admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// Route de test
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes are working',
    status: Admin ? '✅ Admin Model loaded' : '⚠️ Admin Model missing'
  });
});

module.exports = router;