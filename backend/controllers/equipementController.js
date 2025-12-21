const Equipement = require('../models/Equipement');
const User = require('../models/User');

const normalizeRole = (role) => {
  if (!role) return null;
  const normalized = role.toLowerCase().trim();
  const roleMap = {
    'employee': 'employee',
    'employe': 'employee',
    'employé': 'employee',
    'admin': 'admin',
    'administrator': 'admin',
    'administrateur': 'admin',
    'technicien': 'technician',
    'technician': 'technician',
    'tech': 'technician'
  };
  return roleMap[normalized] || normalized;
};

// ✅ VÉRIFIER SI L'UTILISATEUR EST UN EMPLOYÉ
const isEmployee = async (userId) => {
  if (!userId) return false;
  try {
    const user = await User.findById(userId).select('role');
    if (!user) return false;
    return normalizeRole(user.role) === 'employee';
  } catch (err) {
    console.error('Erreur vérification rôle:', err);
    return false;
  }
};

// LISTER LES ÉQUIPEMENTS
exports.listerEquipements = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user.role);
    const userId = req.user._id;

    let filter = {};

    if (userRole === 'employee') {
      filter = { assignedTo: userId };
    }

    const equipements = await Equipement.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: equipements.length,
      data: equipements
    });
  } catch (error) {
    console.error('❌ Erreur listerEquipements:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// OBTENIR UN ÉQUIPEMENT
exports.obtenirEquipement = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user.role);
    const equipement = await Equipement.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!equipement) {
      return res.status(404).json({ success: false, message: 'Équipement non trouvé' });
    }

    if (userRole === 'employee' && (!equipement.assignedTo || equipement.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    res.json({ success: true, data: equipement });
  } catch (error) {
    console.error('❌ Erreur obtenirEquipement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// AJOUTER UN ÉQUIPEMENT
// AJOUTER UN ÉQUIPEMENT
exports.ajouterEquipement = async (req, res) => {
  try {
    const { equipment, affectation } = req.body;

    console.log('📥 [BACKEND] Données reçues:', { equipment, affectation });

    if (!equipment || !equipment.nom || !equipment.type || !equipment.numeroSerie || !equipment.dateAchat) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    const existant = await Equipement.findOne({ numeroSerie: equipment.numeroSerie.trim().toUpperCase() });
    if (existant) {
      return res.status(400).json({ success: false, message: 'Numéro de série déjà utilisé' });
    }

    let assignedTo = null;
    let statut = 'Disponible';
    const affectations = [];

    // 🔥 SI AFFECTATION, ON CRÉE L'ENTRÉE DANS LA COLLECTION AFFECTATIONS
    let affectationCreated = null;
    if (affectation && affectation.employeId) {
      if (!await isEmployee(affectation.employeId)) {
        return res.status(403).json({ success: false, message: 'Assignation réservée aux employés' });
      }

      // 1. Créer l'équipement d'abord
      const newEquipement = new Equipement({
        nom: equipment.nom.trim(),
        type: equipment.type,
        numeroSerie: equipment.numeroSerie.trim().toUpperCase(),
        dateAchat: new Date(equipment.dateAchat),
        statut: 'Assigné',
        assignedTo: affectation.employeId,
        createdBy: req.user._id,
        affectations: [{
          assignedTo: affectation.employeId,
          dateAffectation: new Date(),
          etat: affectation.etat || 'Bon état'
        }]
      });

      await newEquipement.save();

      // 2. Créer l'affectation dans la collection Affectation
      const Affectation = require('../models/Affectation');
      affectationCreated = await Affectation.create({
        employeId: affectation.employeId,
        equipementId: newEquipement._id,
        dateAffectation: new Date(),
        etat: affectation.etat || 'Bon état',
        createdBy: req.user._id
      });

      console.log('✅ [BACKEND] Affectation créée:', affectationCreated);

      await newEquipement.populate(['assignedTo', 'createdBy']);

      return res.status(201).json({
        success: true,
        message: 'Équipement créé et assigné',
        data: newEquipement,
        affectation: affectationCreated
      });
    }

    // Équipement sans affectation
    const newEquipement = new Equipement({
      nom: equipment.nom.trim(),
      type: equipment.type,
      numeroSerie: equipment.numeroSerie.trim().toUpperCase(),
      dateAchat: new Date(equipment.dateAchat),
      statut: 'Disponible',
      assignedTo: null,
      createdBy: req.user._id,
      affectations: []
    });

    await newEquipement.save();
    await newEquipement.populate(['assignedTo', 'createdBy']);

    res.status(201).json({
      success: true,
      message: 'Équipement ajouté',
      data: newEquipement
    });
  } catch (error) {
    console.error('❌ Erreur ajouterEquipement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// METTRE À JOUR UN ÉQUIPEMENT
exports.mettreAJourEquipement = async (req, res) => {
  try {
    const { equipment, affectation } = req.body;
    const equip = await Equipement.findById(req.params.id);

    if (!equip) {
      return res.status(404).json({ success: false, message: 'Équipement non trouvé' });
    }

    console.log('📝 [BACKEND UPDATE] Données reçues:', { equipment, affectation });

    // Mise à jour champs de base
    equip.nom = equipment?.nom?.trim() || equip.nom;
    equip.type = equipment?.type || equip.type;
    equip.numeroSerie = equipment?.numeroSerie?.trim()?.toUpperCase() || equip.numeroSerie;
    equip.dateAchat = equipment?.dateAchat ? new Date(equipment.dateAchat) : equip.dateAchat;

    // 🔥 IMPORTANT: Importer le modèle Affectation
    const Affectation = require('../models/Affectation');

    // Gestion assignation
    if (affectation !== undefined) {
      if (affectation && affectation.employeId) {
        if (!await isEmployee(affectation.employeId)) {
          return res.status(403).json({ success: false, message: 'Assignation réservée aux employés' });
        }

        // 1. Clôturer l'ancienne affectation dans Equipement.affectations
        const active = equip.affectations.find(a => !a.dateRetour);
        if (active) {
          active.dateRetour = new Date();
          console.log('🔄 Ancienne affectation clôturée dans Equipement');
        }

        // 2. Clôturer l'ancienne affectation dans la collection Affectation
        const oldAffectations = await Affectation.updateMany(
          { equipementId: equip._id, dateRetour: { $exists: false } },
          { dateRetour: new Date(), updatedBy: req.user._id }
        );
        console.log(`🔄 ${oldAffectations.modifiedCount} affectation(s) clôturée(s) dans la collection`);

        // 3. Nouvelle affectation dans Equipement.affectations
        equip.affectations.push({
          assignedTo: affectation.employeId,
          dateAffectation: new Date(),
          etat: affectation.etat || 'Bon état'
        });

        // 4. Créer nouvelle affectation dans la collection Affectation
        const newAffectation = await Affectation.create({
          employeId: affectation.employeId,
          equipementId: equip._id,
          dateAffectation: new Date(),
          etat: affectation.etat || 'Bon état',
          createdBy: req.user._id
        });

        console.log('✅ Nouvelle affectation créée:', newAffectation._id);

        equip.assignedTo = affectation.employeId;
        equip.statut = 'Assigné';
      } else {
        // Désassignation
        const active = equip.affectations.find(a => !a.dateRetour);
        if (active) {
          active.dateRetour = new Date();
          console.log('🔄 Affectation clôturée dans Equipement');
        }

        // Clôturer dans la collection Affectation
        const closedAffectations = await Affectation.updateMany(
          { equipementId: equip._id, dateRetour: { $exists: false } },
          { dateRetour: new Date(), updatedBy: req.user._id }
        );
        console.log(`🔄 ${closedAffectations.modifiedCount} affectation(s) clôturée(s)`);

        equip.assignedTo = null;
        equip.statut = 'Disponible';
      }
    }

    equip.updatedBy = req.user._id;
    await equip.save();
    await equip.populate(['assignedTo', 'createdBy']);

    console.log('✅ Équipement mis à jour:', equip._id, '- Statut:', equip.statut);

    res.json({
      success: true,
      message: 'Équipement mis à jour',
      data: equip
    });
  } catch (error) {
    console.error('❌ Erreur mettreAJourEquipement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};
// SUPPRIMER UN ÉQUIPEMENT
exports.supprimerEquipement = async (req, res) => {
  try {
    const equip = await Equipement.findByIdAndDelete(req.params.id);
    if (!equip) return res.status(404).json({ success: false, message: 'Équipement non trouvé' });
    res.json({ success: true, message: 'Équipement supprimé' });
  } catch (error) {
    console.error('❌ Erreur supprimerEquipement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};