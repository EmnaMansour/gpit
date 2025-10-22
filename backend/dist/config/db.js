"use strict";
const mongoose = require('mongoose');
async function connectDB(uri) {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connecté avec succès');
    }
    catch (err) {
        console.error('❌ Erreur de connexion MongoDB :', err.message);
        process.exit(1);
    }
}
// Gestion propre de la déconnexion
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB déconnecté');
    process.exit(0);
});
module.exports = { connectDB, mongoose };
