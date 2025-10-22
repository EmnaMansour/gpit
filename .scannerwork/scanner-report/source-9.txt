const nodemailer = require('nodemailer');

console.log('📧 Initialisation du service email...');

// Solution simple et fiable
const sendVerificationEmail = async (email, token, userName) => {
  try {
    console.log(`📧 Tentative d'envoi à: ${email}`);
    
    // Lien de vérification direct
    const verificationUrl = `http://localhost:5173/verify-email/${token}`;
    
    // SIMULATION - Affiche le lien dans la console
    console.log('🔗 LIEN DE VÉRIFICATION DIRECT:');
    console.log('📎 URL:', verificationUrl);
    console.log('🔐 Token:', token);
    console.log('👤 Pour:', userName);
    console.log('✉️  Email:', email);
    
    // Dans un vrai environnement, ici vous mettriez la vraie configuration
    // Pour l'instant, on simule l'envoi
    
    return {
      success: true,
      simulated: true,
      verificationUrl: verificationUrl,
      message: `Lien généré: ${verificationUrl}`
    };

  } catch (error) {
    console.error('❌ Erreur email:', error);
    
    // Retourner le lien même en cas d'erreur
    const verificationUrl = `http://localhost:5173/verify-email/${token}`;
    
    return {
      success: false,
      verificationUrl: verificationUrl,
      error: error.message
    };
  }
};

const sendWelcomeEmail = async (email, userName) => {
  console.log(`🎉 Email de bienvenue simulé pour: ${email}`);
  return { success: true, simulated: true };
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};