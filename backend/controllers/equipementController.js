const Equipement = require('../models/Equipement');
const Affectation = require('../models/Affectation'); // Assure-toi d'importer le modèle Affectation

// ✅ LISTER LES ÉQUIPEMENTS - VERSION CORRIGÉE
exports.listerEquipements = async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    const userId = req.user._id;

    console.log('[EQUIPEMENTS] Requête de listerEquipements:', {
      userId: userId.toString(),
      userRole,
      userEmail: req.user.email
    });

    let equipmentIdsForEmployee = [];

    // ✅ CORRECTION : Si c'est un employé, on récupère ses équipements via les affectations
    if (userRole === 'employe') {
      console.log('[EQUIPEMENTS] Employé détecté - Recherche des affectations actives');
      
      // Récupérer toutes les affectations actives de cet employé
      const affectationsActives = await Affectation.find({
        employeId: userId,
        dateRetour: { $exists: false } // Pas de date de retour = affectation active
      }).populate('equipementId', '_id');
      
      console.log(`[EQUIPEMENTS] ${affectationsActives.length} affectation(s) active(s) trouvée(s)`);
      
      // Extraire les IDs des équipements assignés
      equipmentIdsForEmployee = affectationsActives
        .map(aff => aff.equipementId?._id)
        .filter(id => id != null);
      
      console.log('[EQUIPEMENTS] IDs équipements assignés:', equipmentIdsForEmployee);
    }

    let filter = {};

    // ✅ FILTRAGE PAR RÔLE
    if (userRole === 'admin' || userRole === 'technicien') {
      // Admin et Technicien voient tous les équipements
      filter = {};
      console.log(`[EQUIPEMENTS] ${userRole.toUpperCase()} détecté - Affichage de TOUS les équipements`);
    } else if (userRole === 'employe') {
      // Employé voit seulement les équipements qui lui sont assignés via affectations
      if (equipmentIdsForEmployee.length > 0) {
        filter = { _id: { $in: equipmentIdsForEmployee } };
        console.log(`[EQUIPEMENTS] Filtre employé appliqué: ${equipmentIdsForEmployee.length} équipement(s)`);
      } else {
        // Aucun équipement assigné
        filter = { _id: { $in: [] } }; // Retourne un tableau vide
        console.log('[EQUIPEMENTS] Aucun équipement assigné à cet employé');
      }
    } else {
      // Rôle inconnu - comportement sécurisé
      filter = { _id: { $in: [] } };
      console.log('[EQUIPEMENTS] Rôle inconnu - Aucun équipement retourné');
    }

    const equipements = await Equipement.find(filter)
      .populate('assignedTo', 'name email _id')
      .populate('createdBy', 'name email _id')
      .sort({ createdAt: -1 });

    console.log(`[EQUIPEMENTS] ${equipements.length} équipement(s) trouvé(s) avec filtre:`, filter);

    // Log détaillé pour debug
    if (userRole === 'employe') {
      console.log('[EQUIPEMENTS] Équipements retournés pour employé:', equipements.map(e => ({
        id: e._id,
        nom: e.nom,
        type: e.type,
        statut: e.statut
      })));
    }

    res.json({
      success: true,
      total: equipements.length,
      userRole,
      data: equipements
    });

  } catch (error) {
    console.error('❌ Erreur listerEquipements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des équipements',
      error: error.message
    });
  }
};

// ✅ OBTENIR UN ÉQUIPEMENT SPÉCIFIQUE - VERSION CORRIGÉE
exports.obtenirEquipement = async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    const userId = req.user._id;
    const equipementId = req.params.id;

    const equipement = await Equipement.findById(equipementId)
      .populate('assignedTo', 'name email _id')
      .populate('createdBy', 'name email _id');

    if (!equipement) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé'
      });
    }

    // ✅ CORRECTION : Vérifier l'accès via les affectations pour les employés
    if (userRole === 'employe') {
      // Vérifier si cet équipement est assigné à l'employé via une affectation active
      const affectationActive = await Affectation.findOne({
        equipementId: equipementId,
        employeId: userId,
        dateRetour: { $exists: false } // Pas de date de retour = affectation active
      });

      if (!affectationActive) {
        console.log('[EQUIPEMENTS] Accès refusé - Équipement non assigné à cet employé:', {
          userRole,
          userId: userId.toString(),
          equipementId
        });
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas accès à cet équipement'
        });
      }
      
      console.log('[EQUIPEMENTS] Accès autorisé - Équipement assigné via affectation');
    }

    res.json({
      success: true,
      data: equipement
    });

  } catch (error) {
    console.error('❌ Erreur obtenirEquipement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'équipement',
      error: error.message
    });
  }
};

// Garder les autres fonctions inchangées
exports.ajouterEquipement = async (req, res) => {
  try {
    const { nom, type, statut, assignedTo, numeroSerie, dateAchat } = req.body;

    if (!nom || !type || !numeroSerie || !dateAchat) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, type, numeroSerie et dateAchat sont obligatoires'
      });
    }

    // Vérifier que numeroSerie est unique
    const existant = await Equipement.findOne({ numeroSerie });
    if (existant) {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro de série existe déjà'
      });
    }

    const newEquipement = new Equipement({
      nom,
      type,
      statut: statut || 'Disponible',
      assignedTo: assignedTo || null,
      numeroSerie,
      dateAchat,
      createdBy: req.user._id
    });

    await newEquipement.save();

    // Repeupler après la sauvegarde
    await newEquipement.populate('assignedTo', 'name email _id');
    await newEquipement.populate('createdBy', 'name email _id');

    console.log('[EQUIPEMENTS] Nouvel équipement créé:', {
      id: newEquipement._id,
      nom: newEquipement.nom,
      assignedTo: newEquipement.assignedTo?._id
    });

    res.status(201).json({
      success: true,
      message: 'Équipement ajouté avec succès',
      data: newEquipement
    });

  } catch (error) {
    console.error('❌ Erreur ajouterEquipement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'équipement',
      error: error.message
    });
  }
};

exports.mettreAJourEquipement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ne pas permettre de modifier createdBy
    delete updates.createdBy;
    updates.updatedBy = req.user._id;

    const equipement = await Equipement.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email _id')
     .populate('createdBy', 'name email _id');

    if (!equipement) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé'
      });
    }

    console.log('[EQUIPEMENTS] Équipement mis à jour:', {
      id: equipement._id,
      nom: equipement.nom,
      assignedTo: equipement.assignedTo?._id
    });

    res.json({
      success: true,
      message: 'Équipement mis à jour avec succès',
      data: equipement
    });

  } catch (error) {
    console.error('❌ Erreur mettreAJourEquipement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

exports.supprimerEquipement = async (req, res) => {
  try {
    const { id } = req.params;

    const equipement = await Equipement.findByIdAndDelete(id);

    if (!equipement) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé'
      });
    }

    console.log('[EQUIPEMENTS] Équipement supprimé:', {
      id: equipement._id,
      nom: equipement.nom
    });

    res.json({
      success: true,
      message: 'Équipement supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur supprimerEquipement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};