// controllers/contactController.js
const Contact = require('../models/Contact');

// @desc    Créer un nouveau contact
// @route   POST /api/contacts
// @access  Public
const createContact = async (req, res) => {
  try {
    console.log('📨 Données reçues:', req.body);
    
    const { name, email, company, message } = req.body;

    // Validation des champs requis
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Le nom, l\'email et le message sont obligatoires'
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Créer le contact dans la base de données
    const contact = new Contact({
      name,
      email,
      company: company || 'Non spécifié',
      message,
      status: 'pending',
      read: false
    });

    const savedContact = await contact.save();

    // 🔔 ENVOYER NOTIFICATION WEBSOCKET AUX ADMINS
    const io = req.app.get('io');
    if (io) {
      const notificationData = {
        id: savedContact._id,
        type: 'new_contact',
        title: 'Nouveau message de contact',
        message: `${name} a envoyé un nouveau message`,
        data: {
          contactId: savedContact._id,
          name: savedContact.name,
          email: savedContact.email,
          company: savedContact.company,
          preview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
        },
        timestamp: savedContact.createdAt,
        read: false
      };

      // Envoyer la notification à tous les admins connectés
      io.to('admins').emit('new-notification', notificationData);
      
      console.log('🔔 Notification envoyée aux admins:', notificationData.title);
    }

    console.log('✅ Contact sauvegardé:', savedContact._id);

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès ! Nous vous recontacterons rapidement.',
      data: {
        id: savedContact._id,
        name: savedContact.name,
        email: savedContact.email,
        company: savedContact.company,
        timestamp: savedContact.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Erreur création contact:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'enregistrement du message'
    });
  }
};

// @desc    Récupérer tous les contacts (Admin)
// @route   GET /api/contacts
// @access  Private/Admin
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('❌ Erreur récupération contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Récupérer les contacts non lus (Admin)
// @route   GET /api/contacts/pending
// @access  Private/Admin
const getPendingContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ read: false }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('❌ Erreur récupération contacts en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Marquer un contact comme lu
// @route   PATCH /api/contacts/:id/read
// @access  Private/Admin
const markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true, status: 'read' },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Contact marqué comme lu',
      data: contact
    });
  } catch (error) {
    console.error('❌ Erreur marquage comme lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Supprimer un contact
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur suppression contact:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getPendingContacts,
  markAsRead,
  deleteContact
};