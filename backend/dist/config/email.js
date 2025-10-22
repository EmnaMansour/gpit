"use strict";
const nodemailer = require('nodemailer');
// Configuration du transporteur email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Mot de passe d'app Gmail
    }
});
const emailService = {
    // Email d'attente (envoyé à l'admin qui s'enregistre)
    sendConfirmationEmail: async (email, name, confirmToken) => {
        const confirmUrl = `${process.env.FRONTEND_URL}/verify-admin/${confirmToken}`;
        try {
            await transporter.sendMail({
                from: `"Gestion Parc Info" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Vérification de votre compte Admin - Gestion Parc Info',
                html: `
          <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="background: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Bienvenue ${name}! 👋</h2>
              
              <p style="color: #666; font-size: 16px;">
                Merci de votre inscription en tant qu'administrateur.
              </p>
              
              <div style="background: #f9f9f9; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                <p style="color: #666; margin: 0;">
                  <strong>Statut actuel:</strong> ⏳ En attente de confirmation
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Cliquez sur le bouton ci-dessous pour confirmer votre compte:
              </p>
              
              <a href="${confirmUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                ✓ Confirmer mon compte
              </a>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Ce lien expire dans <strong>24 heures</strong>
              </p>
              
              <p style="color: #999; font-size: 12px;">
                Email: ${email}<br>
                Ou copiez ce lien: ${confirmUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">
              <p style="color: #999; font-size: 11px;">
                Si vous n'avez pas demandé cette inscription, ignorez cet email.
              </p>
            </div>
          </div>
        `
            });
            return true;
        }
        catch (error) {
            console.error('Erreur envoi email:', error);
            throw error;
        }
    },
    // Email de confirmation réussie
    sendApprovedEmail: async (email, name) => {
        try {
            await transporter.sendMail({
                from: `"Gestion Parc Info" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '✅ Compte Admin confirmé - Gestion Parc Info',
                html: `
          <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="background: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">✓ Félicitations ${name}!</h2>
              
              <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                <p style="color: #155724; margin: 0;">
                  <strong>Statut:</strong> ✅ Compte confirmé et actif
                </p>
              </div>
              
              <p style="color: #666;">
                Votre compte administrateur a été confirmé avec succès!
              </p>
              
              <p style="color: #666;">
                Vous pouvez maintenant vous connecter à la plateforme avec vos identifiants.
              </p>
              
              <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                Se connecter
              </a>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">
              <p style="color: #999; font-size: 11px;">
                © 2025 Gestion Parc Info. Tous droits réservés.
              </p>
            </div>
          </div>
        `
            });
            return true;
        }
        catch (error) {
            console.error('Erreur envoi email:', error);
            throw error;
        }
    },
    // Email de rejet
    sendRejectedEmail: async (email, name, reason = '') => {
        try {
            await transporter.sendMail({
                from: `"Gestion Parc Info" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '❌ Demande d\'inscription rejetée - Gestion Parc Info',
                html: `
          <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="background: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">Demande rejetée</h2>
              
              <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
                <p style="color: #721c24; margin: 0;">
                  <strong>Statut:</strong> ❌ Demande rejetée
                </p>
              </div>
              
              <p style="color: #666;">
                Bonjour ${name},
              </p>
              
              <p style="color: #666;">
                Nous regrettons de vous informer que votre demande d'inscription en tant qu'administrateur a été rejetée.
              </p>
              
              ${reason ? `<p style="color: #666;"><strong>Raison:</strong> ${reason}</p>` : ''}
              
              <p style="color: #666;">
                Si vous pensez qu'il y a une erreur, veuillez nous contacter.
              </p>
              
              <a href="mailto:${process.env.EMAIL_USER}" style="display: inline-block; background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                Nous contacter
              </a>
            </div>
          </div>
        `
            });
            return true;
        }
        catch (error) {
            console.error('Erreur envoi email:', error);
            throw error;
        }
    }
};
module.exports = emailService;
