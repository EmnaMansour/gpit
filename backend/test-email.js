// backend/test-email.js
// Script pour tester l'envoi d'emails

require('dotenv').config();
const emailService = require('./services/emailService');

const testEmail = async () => {
  console.log('🧪 === TEST DU SERVICE EMAIL ===\n');
  
  // Vérifier la configuration
  console.log('📋 Configuration:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Non défini');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Défini' : '❌ Non défini');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Non défini');
  console.log('\n---\n');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ ERREUR: Variables EMAIL_USER et EMAIL_PASSWORD non définies dans .env');
    console.log('\n📝 Instructions:');
    console.log('1. Créez un fichier .env à la racine du backend');
    console.log('2. Ajoutez ces lignes:');
    console.log('   EMAIL_USER=votre-email@gmail.com');
    console.log('   EMAIL_PASSWORD=votre-mot-de-passe-application');
    console.log('   FRONTEND_URL=http://localhost:3000');
    console.log('\n🔐 Pour obtenir un mot de passe d\'application Gmail:');
    console.log('   https://myaccount.google.com/apppasswords');
    process.exit(1);
  }

  try {
    console.log('📧 Envoi d\'un email de test...\n');
    
    const testData = {
      email: process.env.EMAIL_USER, // Envoyer à soi-même pour le test
      name: 'Utilisateur Test',
      confirmToken: 'test-token-123456'
    };

    console.log('📨 Destinataire:', testData.email);
    console.log('👤 Nom:', testData.name);
    console.log('\n⏳ Envoi en cours...\n');

    await emailService.sendConfirmationEmail(
      testData.email,
      testData.name,
      testData.confirmToken
    );

    console.log('✅ ===  EMAIL ENVOYÉ AVEC SUCCÈS! ===');
    console.log('\n📬 Vérifiez votre boîte de réception:', testData.email);
    console.log('💡 Pensez à vérifier aussi les spams/courrier indésirable\n');
    
  } catch (error) {
    console.error('\n❌ === ERREUR LORS DE L\'ENVOI ===');
    console.error('Type d\'erreur:', error.name);
    console.error('Message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔐 ERREUR D\'AUTHENTIFICATION');
      console.error('Solutions:');
      console.error('1. Vérifiez EMAIL_USER et EMAIL_PASSWORD dans .env');
      console.error('2. Pour Gmail, utilisez un "Mot de passe d\'application"');
      console.error('3. Activez la validation en 2 étapes sur votre compte Gmail');
      console.error('4. Générez un mot de passe d\'application: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🌐 ERREUR DE CONNEXION');
      console.error('Vérifiez votre connexion internet');
    } else {
      console.error('\nStack trace complet:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
};

// Exécuter le test
testEmail();