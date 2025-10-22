"use strict";
// migration-createdBy.js
// Script à exécuter une seule fois pour migrer les équipements existants
const mongoose = require('mongoose');
const Equipement = require('./models/Equipement');
const User = require('./models/User');
async function migrateEquipments() {
    try {
        // Se connecter à MongoDB (ajustez la chaîne de connexion selon votre configuration)
        await mongoose.connect('mongodb://localhost:27017/your_database_name', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('📱 Connexion à MongoDB réussie');
        // Trouver un utilisateur Admin par défaut pour assigner les équipements orphelins
        const adminUser = await User.findOne({ role: 'Admin' });
        if (!adminUser) {
            console.error('❌ Aucun utilisateur Admin trouvé. Créez d\'abord un utilisateur Admin.');
            process.exit(1);
        }
        console.log('👑 Utilisateur Admin trouvé:', adminUser.name);
        // Trouver tous les équipements sans createdBy
        const equipementsWithoutOwner = await Equipement.find({
            createdBy: { $exists: false }
        });
        console.log(`🔄 ${equipementsWithoutOwner.length} équipements à migrer...`);
        if (equipementsWithoutOwner.length === 0) {
            console.log('✅ Tous les équipements ont déjà un propriétaire.');
            process.exit(0);
        }
        // Mettre à jour tous les équipements sans propriétaire
        const updateResult = await Equipement.updateMany({ createdBy: { $exists: false } }, { $set: { createdBy: adminUser._id } });
        console.log(`✅ Migration terminée : ${updateResult.modifiedCount} équipements mis à jour`);
        console.log(`📋 Tous les équipements orphelins ont été assignés à l'Admin : ${adminUser.name}`);
        // Vérification finale
        const remainingOrphans = await Equipement.countDocuments({
            createdBy: { $exists: false }
        });
        if (remainingOrphans === 0) {
            console.log('🎉 Migration réussie ! Tous les équipements ont maintenant un propriétaire.');
        }
        else {
            console.warn(`⚠️  ${remainingOrphans} équipements n'ont toujours pas de propriétaire.`);
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
    finally {
        await mongoose.connection.close();
        console.log('🔌 Connexion MongoDB fermée');
        process.exit(0);
    }
}
// Exécuter la migration
if (require.main === module) {
    console.log('🚀 Démarrage de la migration des équipements...');
    migrateEquipments();
}
module.exports = migrateEquipments;
