const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');


// Import from userController (login & register)
const { loginUser, registerUser } = require('../controllers/userController');

// Import from utilisateurController (CRUD operations)
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  debugUserEquipements,
  deleteUser
} = require('../controllers/utilisateurController');

// ==================== ROUTES PUBLIQUES ====================
router.post('/login', loginUser);
router.post('/register', registerUser);

// ==================== ROUTES PROTÉGÉES ====================
// Appliquer l'authentification à toutes les routes suivantes

// Obtenir tous les users - Tous les utilisateurs authentifiés peuvent voir
router.get('/', authMiddleware(), getUsers);

// Obtenir un user spécifique - Tous les utilisateurs authentifiés peuvent voir
router.get('/:id', authMiddleware(), getUser);

// Créer un user - Admins seulement
router.post('/', authMiddleware('admin'), createUser);

// Modifier un user - Admins seulement
router.put('/:id', authMiddleware('admin'), updateUser);

// Supprimer un user - Admins seulement
router.delete('/:id', authMiddleware('admin'), deleteUser);

router.get('/debug/:id/equipements', authMiddleware('admin'), debugUserEquipements);


// routes/userRoutes.js - AJOUTEZ CETTE ROUTE DE TEST

router.get('/test-affectations/:userId', authMiddleware('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Affectation = require('../models/Affectation');
    const User = require('../models/User');
    const Equipement = require('../models/Equipement');
    
    const userIdStr = req.params.userId;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 TEST DIAGNOSTIC - Utilisateur: ${userIdStr}`);
    console.log(`${'='.repeat(80)}`);
    
    if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
      return res.json({ error: 'ID invalide' });
    }

    const userId = new mongoose.Types.ObjectId(userIdStr);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.json({ error: 'Utilisateur non trouvé' });
    }

    const diagnostic = {
      utilisateur: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tests: {}
    };

    // ========================================
    // TEST 1: Modèle Affectation existe ?
    // ========================================
    console.log(`\n[TEST 1] Vérification modèle Affectation`);
    let modelExists = false;
    try {
      const testAffectation = new Affectation({});
      modelExists = true;
      console.log(`✅ Modèle Affectation existe`);
    } catch (err) {
      console.log(`❌ Modèle Affectation introuvable:`, err.message);
    }
    
    diagnostic.tests.modelExists = modelExists;

    if (!modelExists) {
      console.log(`${'='.repeat(80)}\n`);
      return res.json({
        ...diagnostic,
        conclusion: '❌ PROBLÈME: Le modèle Affectation n\'existe pas !'
      });
    }

    // ========================================
    // TEST 2: Affectations en base de données
    // ========================================
    console.log(`\n[TEST 2] Recherche affectations en BD`);
    
    const toutesAffectations = await Affectation.find({});
    console.log(`📊 Total affectations en BD: ${toutesAffectations.length}`);
    
    diagnostic.tests.totalAffectations = toutesAffectations.length;
    
    if (toutesAffectations.length > 0) {
      console.log(`\n📋 Analyse de toutes les affectations:`);
      toutesAffectations.forEach((aff, index) => {
        console.log(`\n   Affectation ${index + 1}:`);
        console.log(`   - ID: ${aff._id}`);
        console.log(`   - employeId: ${aff.employeId} (type: ${typeof aff.employeId})`);
        console.log(`   - equipementId: ${aff.equipementId}`);
        console.log(`   - dateAffectation: ${aff.dateAffectation}`);
        console.log(`   - dateRetour: ${aff.dateRetour || 'null'}`);
        console.log(`   - etat: ${aff.etat || '-'}`);
      });
    }

    // ========================================
    // TEST 3: Affectations de l'utilisateur
    // ========================================
    console.log(`\n[TEST 3] Recherche affectations pour userId: ${userIdStr}`);
    
    // Méthode 1: ObjectId direct
    const affectations1 = await Affectation.find({ employeId: userId });
    console.log(`Méthode 1 (ObjectId): ${affectations1.length} affectation(s)`);
    
    // Méthode 2: String
    const affectations2 = await Affectation.find({ employeId: userIdStr });
    console.log(`Méthode 2 (String): ${affectations2.length} affectation(s)`);
    
    // Méthode 3: Analyse manuelle
    const affectationsManuelles = toutesAffectations.filter(aff => {
      if (!aff.employeId) return false;
      const employeIdStr = aff.employeId.toString();
      return employeIdStr === userIdStr;
    });
    console.log(`Méthode 3 (Manuelle): ${affectationsManuelles.length} affectation(s)`);
    
    diagnostic.tests.affectationsUser = {
      method1_ObjectId: affectations1.length,
      method2_String: affectations2.length,
      method3_Manual: affectationsManuelles.length,
      details: affectationsManuelles.map(aff => ({
        id: aff._id,
        employeId: aff.employeId?.toString(),
        equipementId: aff.equipementId?.toString(),
        dateRetour: aff.dateRetour,
        etat: aff.etat
      }))
    };

    // ========================================
    // TEST 4: Affectations ACTIVES
    // ========================================
    console.log(`\n[TEST 4] Recherche affectations ACTIVES`);
    
    const affectationsActives = affectationsManuelles.filter(aff => {
      const hasNoReturn = !aff.dateRetour || aff.dateRetour === null;
      console.log(`   Affectation ${aff._id}: dateRetour=${aff.dateRetour}, active=${hasNoReturn}`);
      return hasNoReturn;
    });
    
    console.log(`✅ ${affectationsActives.length} affectation(s) active(s)`);
    
    diagnostic.tests.affectationsActives = {
      count: affectationsActives.length,
      details: affectationsActives.map(aff => ({
        id: aff._id,
        equipementId: aff.equipementId?.toString(),
        etat: aff.etat,
        dateAffectation: aff.dateAffectation
      }))
    };

    // ========================================
    // TEST 5: Requête MongoDB utilisée par deleteUser
    // ========================================
    console.log(`\n[TEST 5] Test de la requête exacte utilisée par deleteUser`);
    
    const queryResult = await Affectation.find({
      employeId: userId,
      $or: [
        { dateRetour: { $exists: false } },
        { dateRetour: null }
      ]
    });
    
    console.log(`Requête MongoDB deleteUser: ${queryResult.length} résultat(s)`);
    
    diagnostic.tests.deleteUserQuery = {
      count: queryResult.length,
      details: queryResult.map(aff => ({
        id: aff._id,
        employeId: aff.employeId?.toString(),
        equipementId: aff.equipementId?.toString(),
        dateRetour: aff.dateRetour,
        etat: aff.etat
      }))
    };

    // ========================================
    // TEST 6: Populate équipements
    // ========================================
    if (affectationsActives.length > 0) {
      console.log(`\n[TEST 6] Populate équipements`);
      
      const affectationsWithEquipment = await Affectation.find({
        employeId: userId,
        $or: [
          { dateRetour: { $exists: false } },
          { dateRetour: null }
        ]
      }).populate('equipementId', 'nom type numeroSerie');
      
      console.log(`Équipements assignés:`);
      affectationsWithEquipment.forEach((aff, index) => {
        const equip = aff.equipementId;
        if (equip) {
          console.log(`   ${index + 1}. ${equip.nom} (${equip.type}) - N°${equip.numeroSerie}`);
        }
      });
      
      diagnostic.tests.equipementsAssignes = affectationsWithEquipment.map(aff => ({
        nom: aff.equipementId?.nom,
        type: aff.equipementId?.type,
        numeroSerie: aff.equipementId?.numeroSerie
      }));
    }

    // ========================================
    // CONCLUSION
    // ========================================
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 RÉSUMÉ`);
    console.log(`${'='.repeat(80)}`);
    
    const peutSupprimer = affectationsActives.length === 0;
    
    diagnostic.conclusion = {
      peutSupprimer,
      affectationsActives: affectationsActives.length,
      message: peutSupprimer 
        ? '✅ AUCUNE AFFECTATION ACTIVE - Suppression autorisée'
        : `❌ ${affectationsActives.length} AFFECTATION(S) ACTIVE(S) - Suppression BLOQUÉE`
    };
    
    console.log(diagnostic.conclusion.message);
    console.log(`${'='.repeat(80)}\n`);

    res.json(diagnostic);

  } catch (error) {
    console.error('❌ Erreur test diagnostic:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

// ========================================
// ROUTE DE TEST: Tester la suppression (sans supprimer)
// ========================================
router.get('/test-delete/:userId', authMiddleware('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Affectation = require('../models/Affectation');
    const User = require('../models/User');
    const Incident = require('../models/Incident');
    const Equipement = require('../models/Equipement');
    
    const userIdStr = req.params.userId;
    const userId = new mongoose.Types.ObjectId(userIdStr);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ error: 'Utilisateur non trouvé' });
    }

    console.log(`\n🧪 TEST SUPPRESSION (simulation) - ${user.name}`);

    const blocages = [];

    // Test 1: Incidents
    const incidents = await Incident.find({
      $or: [{ reportedBy: userId }, { assignedTo: userId }]
    });
    
    if (incidents.length > 0) {
      blocages.push({
        type: 'incidents',
        count: incidents.length,
        message: `${incidents.length} incident(s)`
      });
    }

    // Test 2: Affectations
    const affectations = await Affectation.find({
      employeId: userId,
      $or: [
        { dateRetour: { $exists: false } },
        { dateRetour: null }
      ]
    }).populate('equipementId', 'nom type');
    
    if (affectations.length > 0) {
      blocages.push({
        type: 'affectations',
        count: affectations.length,
        message: `${affectations.length} affectation(s) active(s)`,
        equipements: affectations.map(a => a.equipementId?.nom)
      });
    }

    // Test 3: Équipements créés
    const equipementsCrees = await Equipement.find({ createdBy: userId });
    
    if (equipementsCrees.length > 0) {
      blocages.push({
        type: 'equipements_created',
        count: equipementsCrees.length,
        message: `${equipementsCrees.length} équipement(s) créé(s)`
      });
    }

    const result = {
      utilisateur: { name: user.name, email: user.email },
      blocages,
      peutSupprimer: blocages.length === 0,
      conclusion: blocages.length === 0
        ? '✅ SUPPRESSION AUTORISÉE'
        : `❌ SUPPRESSION BLOQUÉE: ${blocages.map(b => b.message).join(', ')}`
    };

    console.log(`Résultat:`, result.conclusion);

    res.json(result);

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;