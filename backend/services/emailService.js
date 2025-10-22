// backend/services/emailService.js
const nodemailer = require('nodemailer');

console.log('📧 Initialisation du service email...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✓ Configuré' : '✗ Manquant');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Configuré' : '✗ Manquant');

// Configuration du transporteur email
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('✅ Configuration Gmail détectée');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  console.log('⚠️  Mode développement - Utilisation d\'Ethereal Email');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'jordi.herzog@ethereal.email',
      pass: '6X4yJ1a8zQ1qSg8zYV'
    }
  });
};

const transporter = createTransporter();

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur configuration email:', error);
  } else {
    console.log('✅ Serveur email prêt à envoyer des messages');
  }
});

const emailService = {
  /**
   * ✅ ENVOYER LES COORDONNÉES DE L'UTILISATEUR À L'ADMIN AVEC BOUTONS D'ACTION
   */
  sendAdminNotification: async (userData) => {
    const adminEmail = 'emnamansour77@gmail.com';
    
    try {
      console.log('📧 Envoi des coordonnées utilisateur à l\'admin...');
      
      // URLs d'action directes
      const approveUrl = `http://localhost:8000/api/users/quick-approve/${userData.userId}`;
      const rejectUrl = `http://localhost:8000/api/users/quick-reject/${userData.userId}`;
      const adminPanelUrl = 'http://localhost:5173/admin/users';
      
      const mailOptions = {
        from: `"Système GPIT" <${process.env.EMAIL_USER || 'noreply@gpit.com'}>`,
        to: adminEmail,
        subject: '👤 ACTION REQUISE - Nouvelle Demande d\'Accès GPIT',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0; 
                padding: 40px 20px;
                min-height: 100vh;
              }
              .container { 
                max-width: 700px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 15px; 
                overflow: hidden; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 40px 30px; 
                text-align: center; 
                color: white; 
              }
              .content { 
                padding: 40px; 
              }
              .user-card { 
                background: #f8f9fa; 
                border-radius: 12px; 
                padding: 30px; 
                margin: 25px 0; 
                border-left: 5px solid #667eea;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
              }
              .info-table { 
                width: 100%; 
                border-collapse: collapse; 
              }
              .info-table td { 
                padding: 14px 0; 
                border-bottom: 1px solid #e9ecef; 
                vertical-align: top;
              }
              .info-table td:first-child { 
                font-weight: 600; 
                color: #495057; 
                width: 35%; 
                font-size: 15px;
              }
              .info-table td:last-child { 
                color: #212529; 
                font-size: 15px;
              }
              .email-actions { 
                text-align: center; 
                margin: 40px 0; 
                padding: 30px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 12px;
                border: 2px dashed #dee2e6;
              }
              .email-button { 
                display: inline-block; 
                padding: 16px 35px; 
                margin: 0 12px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: bold; 
                font-size: 16px; 
                color: white;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                min-width: 180px;
              }
              .email-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
              }
              .approve-btn { 
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              }
              .approve-btn:hover { 
                background: linear-gradient(135deg, #218838 0%, #1e9e8a 100%);
              }
              .reject-btn { 
                background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
              }
              .reject-btn:hover { 
                background: linear-gradient(135deg, #c82333 0%, #d91a7a 100%);
              }
              .direct-link { 
                display: block; 
                margin-top: 25px; 
                color: #667eea; 
                text-decoration: none;
                font-size: 15px;
                font-weight: 500;
              }
              .direct-link:hover {
                text-decoration: underline;
              }
              .footer { 
                background: #2c3e50; 
                padding: 25px; 
                text-align: center; 
                color: #ecf0f1; 
                font-size: 13px;
              }
              .urgent { 
                background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); 
                border: none;
                padding: 20px; 
                border-radius: 10px; 
                margin: 0 0 30px 0;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              .timestamp { 
                color: #6c757d; 
                font-size: 14px; 
                text-align: center; 
                margin: 25px 0; 
                font-style: italic;
              }
              .action-title {
                font-size: 20px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 20px;
                text-align: center;
              }
              .quick-note {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
                font-size: 14px;
                color: #1565c0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🎯 ACTION REQUISE</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Nouvelle demande d'accès GPIT</p>
              </div>
              
              <div class="content">
                <div class="urgent">
                  <strong style="font-size: 18px; color: #2d3436;">🚨 VALIDATION ADMINISTRATEUR REQUISE</strong>
                  <p style="margin: 10px 0 0 0; color: #636e72; font-size: 15px;">
                    Un nouvel utilisateur demande l'accès à votre plateforme. Veuillez prendre une décision.
                  </p>
                </div>

                <div class="user-card">
                  <h2 style="color: #2c3e50; margin-top: 0; font-size: 24px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                    👤 COORDONNÉES DU DEMANDEUR
                  </h2>
                  
                  <table class="info-table">
                    <tr>
                      <td>Nom complet :</td>
                      <td><strong style="color: #2c3e50; font-size: 18px;">${userData.name}</strong></td>
                    </tr>
                    <tr>
                      <td>Email :</td>
                      <td>
                        <strong style="color: #667eea; font-size: 16px;">${userData.email}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Rôle demandé :</td>
                      <td>
                        <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                          ${userData.role === 'technicien' ? '🔧 TECHNICIEN' : '👨‍💼 EMPLOYÉ'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Téléphone :</td>
                      <td>
                        ${userData.phone ? 
                          `<span style="color: #27ae60; font-weight: 600;">${userData.phone}</span>` : 
                          '<em style="color: #95a5a6;">Non renseigné</em>'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>Département :</td>
                      <td>
                        ${userData.department ? 
                          `<span style="color: #e67e22; font-weight: 600;">${userData.department}</span>` : 
                          '<em style="color: #95a5a6;">Non renseigné</em>'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>Date de demande :</td>
                      <td>
                        <span style="color: #7f8c8d; font-weight: 600;">
                          ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Statut actuel :</td>
                      <td>
                        <strong style="color: #f39c12; font-size: 16px;">
                          ⏳ EN ATTENTE DE VOTRE VALIDATION
                        </strong>
                      </td>
                    </tr>
                  </table>
                </div>

                <div class="timestamp">
                  📅 Demande reçue le ${new Date().toLocaleString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                <!-- SECTION BOUTONS D'ACTION -->
                <div class="email-actions">
                  <div class="action-title">
                    🎯 CHOISISSEZ VOTRE ACTION
                  </div>
                  
                  <div class="quick-note">
                    💡 <strong>Action rapide :</strong> Cliquez sur un bouton pour décider immédiatement
                  </div>
                  
                  <div style="margin: 25px 0;">
                    <a href="${approveUrl}" class="email-button approve-btn">
                      ✅ VALIDER L'ACCÈS
                    </a>
                    
                    <a href="${rejectUrl}" class="email-button reject-btn">
                      ❌ REFUSER L'ACCÈS
                    </a>
                  </div>

                  <p style="color: #7f8c8d; font-size: 14px; margin: 15px 0 0 0;">
                    <strong>Instructions :</strong><br>
                    • <strong>VALIDER</strong> : L'utilisateur pourra se connecter immédiatement<br>
                    • <strong>REFUSER</strong> : La demande sera définitivement rejetée
                  </p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${adminPanelUrl}" class="direct-link">
                    🔗 Accéder au panneau d'administration complet
                  </a>
                </div>

                <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-top: 30px;">
                  <h4 style="color: #27ae60; margin-top: 0;">📋 POUR INFORMATION :</h4>
                  <ul style="color: #2c3e50; margin-bottom: 0;">
                    <li>L'utilisateur recevra un email de confirmation si validé</li>
                    <li>Vous pouvez consulter l'historique dans le panneau admin</li>
                    <li>Toutes les actions sont tracées et sécurisées</li>
                  </ul>
                </div>
              </div>
              
              <div class="footer">
                <p style="margin: 0 0 10px 0;">
                  <strong>GPIT - Système de Gestion de Parc Informatique</strong>
                </p>
                <p style="margin: 0; opacity: 0.8;">
                  Cet email a été généré automatiquement - Sécurité et confidentialité assurées
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email admin envoyé avec succès!');
      console.log('📨 Destinataire:', adminEmail);
      console.log('👤 Utilisateur:', userData.name);
      console.log('📧 Email utilisateur:', userData.email);
      console.log('🎯 Rôle demandé:', userData.role);
      console.log('🔗 Bouton VALIDER:', approveUrl);
      console.log('🔗 Bouton REFUSER:', rejectUrl);
      
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('👀 Prévisualisation: https://ethereal.email/message/' + result.messageId);
      }
      
      return {
        success: true,
        messageId: result.messageId,
        adminEmail: adminEmail,
        userData: userData,
        approveUrl: approveUrl,
        rejectUrl: rejectUrl
      };
      
    } catch (error) {
      console.error('❌ Erreur envoi email admin:', error);
      
      // Fallback détaillé
      console.log('[FALLBACK] COORDONNÉES UTILISATEUR:');
      console.log('┌─────────────────────────────────────────────────────────');
      console.log('│ 🎯 NOUVELLE DEMANDE D\'ACCÈS - ACTION REQUISE');
      console.log('├─────────────────────────────────────────────────────────');
      console.log('│ 👤 Nom:', userData.name);
      console.log('│ 📧 Email:', userData.email);
      console.log('│ 🎯 Rôle:', userData.role);
      console.log('│ 📞 Téléphone:', userData.phone || 'Non renseigné');
      console.log('│ 🏢 Département:', userData.department || 'Non renseigné');
      console.log('│ ⏰ Date:', new Date().toLocaleString('fr-FR'));
      console.log('│ 📊 Statut: ⏳ EN ATTENTE DE VALIDATION');
      console.log('│');
      console.log('│ 🎯 ACTIONS DISPONIBLES:');
      console.log('│ • VALIDER: http://localhost:8000/api/users/quick-approve/' + userData.userId);
      console.log('│ • REFUSER: http://localhost:8000/api/users/quick-reject/' + userData.userId);
      console.log('│ • PANEL ADMIN: http://localhost:5173/admin/users');
      console.log('└─────────────────────────────────────────────────────────');
      
      return {
        success: false,
        error: error.message,
        simulated: true,
        userData: userData
      };
    }
  },

  // ... autres fonctions (gardez les mêmes que précédemment)
  sendActivationEmail: async (email, name) => {
    try {
      console.log('Envoi confirmation d\'activation à:', email);
      
      const mailOptions = {
        from: `"Système GPIT" <${process.env.EMAIL_USER || 'noreply@gpit.com'}>`,
        to: email,
        subject: '✅ Votre compte GPIT a été validé !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #51cf66 0%, #2f9e44 100%); padding: 30px; text-align: center; color: white;">
              <h1>🎉 COMPTE VALIDÉ !</h1>
              <p>Votre accès a été approuvé par l'administrateur</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Félicitations ${name} !</h2>
              
              <div style="background: #d3f9d8; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #51cf66;">
                <h3>✅ Votre compte est maintenant actif</h3>
                <p>L'administrateur a validé votre demande d'accès à la plateforme GPIT.</p>
                <p><strong>Vous pouvez maintenant vous connecter avec vos identifiants.</strong></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173/login" 
                   style="background: #51cf66; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
                   🔐 SE CONNECTER MAINTENANT
                </a>
              </div>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email d\'activation envoyé à:', email);
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error('Erreur email activation:', error);
      return { success: false, error: error.message, simulated: true };
    }
  },

  sendConfirmationEmail: async (email, name, token) => {
    try {
      console.log('Envoi confirmation d\'inscription à:', email);
      
      const mailOptions = {
        from: `"Système GPIT" <${process.env.EMAIL_USER || 'noreply@gpit.com'}>`,
        to: email,
        subject: '⏳ Votre inscription est en cours de validation - GPIT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ffd43b 0%, #f08c00 100%); padding: 30px; text-align: center; color: white;">
              <h1>📋 Demande Reçue</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Bonjour ${name},</h2>
              
              <div style="background: #fff3bf; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #ffd43b;">
                <h3>⏳ Validation en Cours</h3>
                <p>Votre demande d'inscription a bien été reçue.</p>
                <p><strong>Statut:</strong> En attente de validation par l'administrateur</p>
              </div>
              
              <p style="color: #666; margin-top: 25px;">
                Vous recevrez un email de confirmation une fois votre compte validé.
              </p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email confirmation envoyé à:', email);
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error('Erreur email confirmation:', error);
      return { success: false, error: error.message, simulated: true };
    }
  },

  sendApprovedEmail: async (email, name, reason) => {
    try {
      console.log('Envoi email approbation à:', email);
      
      const mailOptions = {
        from: `"Système GPIT" <${process.env.EMAIL_USER || 'noreply@gpit.com'}>`,
        to: email,
        subject: ' Votre compte GPIT a été approuvé !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #51cf66 0%, #2f9e44 100%); padding: 30px; text-align: center; color: white;">
              <h1>🎉 Compte Approuvé !</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Félicitations ${name} !</h2>
              
              <div style="background: #d3f9d8; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #51cf66;">
                <h3>✅ Votre compte a été approuvé</h3>
                <p>Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme GPIT.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173/login" 
                   style="background: #51cf66; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">
                  🔐 Se connecter maintenant
                </a>
              </div>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email approbation envoyé à:', email);
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error(' Erreur email approbation:', error);
      return { success: false, error: error.message, simulated: true };
    }
  },

  sendRejectedEmail: async (email, name, reason) => {
    try {
      console.log('Envoi email rejet à:', email);
      
      const mailOptions = {
        from: `"Système GPIT" <${process.env.EMAIL_USER || 'noreply@gpit.com'}>`,
        to: email,
        subject: ' Votre demande d\'inscription a été rejetée - GPIT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; text-align: center; color: white;">
              <h1> Demande Rejetée</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Bonjour ${name},</h2>
              
              <div style="background: #f8d7da; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #e74c3c;">
                <h3>Votre demande a été rejetée</h3>
                <p><strong>Raison:</strong> ${reason || 'Non spécifiée'}</p>
              </div>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email rejet envoyé à:', email);
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error('Erreur email rejet:', error);
      return { success: false, error: error.message, simulated: true };
    }
  },

  sendVerificationEmail: async (email, name, token) => {
    console.log('[SIMULATION] Email vérification pour:', email);
    return { success: true, simulated: true };
  }
};

module.exports = emailService;