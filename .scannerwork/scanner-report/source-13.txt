// 1. CORRIGEZ votre contrôleur backend pour ne PAS populate equipementId
exports.obtenirAffectations = async (req, res) => {
  try {
    const affectations = await Affectation.find()
      .populate('employeId', 'name email role') // Récupère les infos de l'employé
      // NE PAS populate equipementId pour garder l'ObjectId simple
      .sort({ dateAffectation: -1 });

    res.status(200).json(affectations);
  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des affectations',
      error: error.message 
    });
  }
};

// 2. OU si vous voulez garder le populate, modifiez les fonctions React :

// Fonction pour obtenir l'employé assigné à un équipement - VERSION CORRIGÉE
const getAssignedEmployee = (equipmentId) => {
  try {
    console.log(`🔍 Recherche employé assigné pour équipement: ${equipmentId}`);
    console.log(`📊 Affectations disponibles:`, affectations);
    
    // Chercher l'affectation active (sans date de retour)
    const activeAffectation = affectations.find(aff => {
      // Gérer les deux cas : equipementId string ou objet populate
      const affEquipmentId = typeof aff.equipementId === 'object' 
        ? aff.equipementId._id || aff.equipementId 
        : aff.equipementId;
      
      const isMatch = affEquipmentId && 
                      affEquipmentId.toString() === equipmentId.toString() && 
                      !aff.dateRetour;
      
      console.log(`🔎 Comparaison: ${affEquipmentId} === ${equipmentId} && !${aff.dateRetour} = ${isMatch}`);
      return isMatch;
    });
    
    if (activeAffectation && activeAffectation.employeId) {
      console.log(`✅ Employé trouvé:`, activeAffectation.employeId);
      return activeAffectation.employeId;
    }
    
    console.log(`❌ Aucun employé assigné trouvé pour équipement ${equipmentId}`);
    return null;
  } catch (error) {
    console.error("❌ Erreur lors de la recherche de l'employé assigné:", error);
    return null;
  }
};

// Fonction pour obtenir l'état lors de l'affectation - VERSION CORRIGÉE
const getAffectationEtat = (equipmentId) => {
  try {
    const activeAffectation = affectations.find(aff => {
      const affEquipmentId = typeof aff.equipementId === 'object' 
        ? aff.equipementId._id || aff.equipementId 
        : aff.equipementId;
      
      return affEquipmentId && 
             affEquipmentId.toString() === equipmentId.toString() && 
             !aff.dateRetour;
    });
    
    if (activeAffectation?.etat) {
      console.log(`📊 État trouvé pour équipement ${equipmentId}:`, activeAffectation.etat);
      return activeAffectation.etat;
    }
    
    return null;
  } catch (error) {
    console.error("❌ Erreur lors de la recherche de l'état d'affectation:", error);
    return null;
  }
};

// Fonction pour obtenir la date d'affectation - VERSION CORRIGÉE
const getAffectationDate = (equipmentId) => {
  try {
    const activeAffectation = affectations.find(aff => {
      const affEquipmentId = typeof aff.equipementId === 'object' 
        ? aff.equipementId._id || aff.equipementId 
        : aff.equipementId;
      
      return affEquipmentId && 
             affEquipmentId.toString() === equipmentId.toString() && 
             !aff.dateRetour;
    });
    
    return activeAffectation?.dateAffectation || null;
  } catch (error) {
    console.error("❌ Erreur lors de la recherche de la date d'affectation:", error);
    return null;
  }
};

// Fonction pour obtenir l'ID de l'affectation active - VERSION CORRIGÉE
const getAffectationId = (equipmentId) => {
  try {
    const activeAffectation = affectations.find(aff => {
      const affEquipmentId = typeof aff.equipementId === 'object' 
        ? aff.equipementId._id || aff.equipementId 
        : aff.equipementId;
      
      return affEquipmentId && 
             affEquipmentId.toString() === equipmentId.toString() && 
             !aff.dateRetour;
    });
    
    return activeAffectation?._id || null;
  } catch (error) {
    console.error("❌ Erreur lors de la recherche de l'ID d'affectation:", error);
    return null;
  }
};

// 3. Ajoutez une fonction de debug pour diagnostiquer le problème
const debugAffectations = () => {
  console.log("🐛 DEBUG - État des affectations:");
  console.log(`📊 Nombre d'affectations: ${affectations.length}`);
  console.log(`📦 Nombre d'équipements: ${equipmentData.length}`);
  
  affectations.forEach((aff, index) => {
    console.log(`\n🔍 Affectation ${index + 1}:`);
    console.log(`  - ID: ${aff._id}`);
    console.log(`  - EquipementId: ${aff.equipementId} (type: ${typeof aff.equipementId})`);
    console.log(`  - EmployeId:`, aff.employeId);
    console.log(`  - Date affectation: ${aff.dateAffectation}`);
    console.log(`  - Date retour: ${aff.dateRetour}`);
    console.log(`  - État: ${aff.etat}`);
    console.log(`  - Est actif: ${!aff.dateRetour}`);
  });
  
  equipmentData.forEach((eq, index) => {
    console.log(`\n📦 Équipement ${index + 1}:`);
    console.log(`  - ID: ${eq._id}`);
    console.log(`  - Nom: ${eq.nom}`);
    console.log(`  - Statut: ${eq.statut}`);
    
    const assignedEmployee = getAssignedEmployee(eq._id);
    console.log(`  - Employé assigné:`, assignedEmployee?.name || 'Aucun');
  });
};

// Appelez cette fonction dans votre useEffect pour débugger :
useEffect(() => {
  loadData().then(() => {
    // Ajoutez ceci temporairement pour débugger
    setTimeout(() => {
      debugAffectations();
    }, 1000);
  });
}, []);