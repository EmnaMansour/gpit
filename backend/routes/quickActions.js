const express = require('express');
const router = express.Router();
const User = require('../models/User');
const emailService = require('../services/emailService');

// ✅ Route pour validation rapide depuis l'email
router.get('/quick-approve/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🎯 Validation rapide demandée pour l'utilisateur: ${userId}`);
    
    // Trouver l'utilisateur
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;"> Utilisateur non trouvé</h1>
          <p>L'utilisateur demandé n'existe pas ou a déjà été traité.</p>
          <a href="http://localhost:5173/admin/users" style="color: #007bff;">Retour au panneau admin</a>
        </div>
      `);
    }
    
    if (user.status !== 'pending') {
      return res.status(400).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ffc107;">Action déjà effectuée</h1>
          <p>Cet utilisateur a déjà été traité (statut: ${user.status}).</p>
          <a href="http://localhost:5173/admin/users" style="color: #007bff;">Retour au panneau admin</a>
        </div>
      `);
    }
    
    // Mettre à jour le statut
    user.status = 'active';
    user.approvedAt = new Date();
    await user.save();
    
    console.log(`✅ Utilisateur ${user.email} validé avec succès via lien rapide`);
    
    // Envoyer email de confirmation
    await emailService.sendActivationEmail(user.email, user.name);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Utilisateur Validé - GPIT</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            max-width: 600px; 
            background: white; 
            border-radius: 15px; 
            overflow: hidden; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
          }
          .header { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            padding: 40px 30px; 
            color: white; 
          }
          .content { 
            padding: 40px; 
          }
          .success-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px;
            font-weight: bold;
          }
          .user-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1 style="margin: 0; font-size: 32px;">COMPTE VALIDÉ !</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Utilisateur approuvé avec succès</p>
          </div>
          
          <div class="content">
            <h2 style="color: #28a745;">Félicitations !</h2>
            <p>L'utilisateur a été validé et peut maintenant accéder à la plateforme.</p>
            
            <div class="user-info">
              <h3>👤 Détails de l'utilisateur :</h3>
              <p><strong>Nom :</strong> ${user.name}</p>
              <p><strong>Email :</strong> ${user.email}</p>
              <p><strong>Rôle :</strong> ${user.role}</p>
              <p><strong>Statut :</strong> <span style="color: #28a745; font-weight: bold;">ACTIF</span></p>
              <p><strong>Validé le :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>
            
            <p>Un email de confirmation a été envoyé à l'utilisateur.</p>
            
            <div style="margin-top: 30px;">
              <a href="http://localhost:5173/admin/users" class="button">
                 Panneau d'administration
              </a>
              <a href="http://localhost:5173" class="button" style="background: #6c757d;">
                 Accueil
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error(' Erreur validation rapide:', error);
    res.status(500).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #dc3545;"> Erreur lors de la validation</h1>
        <p>Une erreur est survenue: ${error.message}</p>
        <a href="http://localhost:5173/admin/users" style="color: #007bff;">Retour au panneau admin</a>
      </div>
    `);
  }
});

// ❌ Route pour rejet rapide depuis l'email
router.get('/quick-reject/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(` Rejet rapide demandé pour l'utilisateur: ${userId}`);
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;"> Utilisateur non trouvé</h1>
          <p>L'utilisateur demandé n'existe pas ou a déjà été traité.</p>
          <a href="http://localhost:5173/admin/users" style="color: #007bff;">Retour au panneau admin</a>
        </div>
      `);
    }
    
    if (user.status !== 'pending') {
      return res.status(400).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ffc107;"> Action déjà effectuée</h1>
          <p>Cet utilisateur a déjà été traité (statut: ${user.status}).</p>
          <a href="http://localhost:5173/admin/users" style="color: #007bff;">Retour au panneau admin</a>
        </div>
      `);
    }
    
    // Mettre à jour le statut
    user.status = 'rejected';
    user.approvedAt = new Date();
    await user.save();
    
    console.log(` Utilisateur ${user.email} rejeté via lien rapide`);
    
    // Envoyer email de rejet
    await emailService.sendRejectedEmail(user.email, user.name, 'Demande refusée par l\'administrateur');
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Utilisateur Rejeté - GPIT</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            max-width: 600px; 
            background: white; 
            border-radius: 15px; 
            overflow: hidden; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
          }
          .header { 
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
            padding: 40px 30px; 
            color: white; 
          }
          .content { 
            padding: 40px; 
          }
          .reject-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #6c757d;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px;
            font-weight: bold;
          }
          .user-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="reject-icon">❌</div>
            <h1 style="margin: 0; font-size: 32px;">COMPTE REJETÉ</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Demande refusée avec succès</p>
          </div>
          
          <div class="content">
            <h2 style="color: #dc3545;">Demande rejetée</h2>
            <p>L'accès de cet utilisateur a été refusé.</p>
            
            <div class="user-info">
              <h3>Détails de l'utilisateur :</h3>
              <p><strong>Nom :</strong> ${user.name}</p>
              <p><strong>Email :</strong> ${user.email}</p>
              <p><strong>Rôle :</strong> ${user.role}</p>
              <p><strong>Statut :</strong> <span style="color: #dc3545; font-weight: bold;">REJETÉ</span></p>
              <p><strong>Rejeté le :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>
            
            <p>Un email de notification a été envoyé à l'utilisateur.</p>
            
            <div style="margin-top: 30px;">
              <a href="http://localhost:5173/admin/users" class="button">
                 Panneau d'administration
              </a>
              <a href="http://localhost:5173" class="button" style="background: #007bff;">
                 Accueil
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error(' Erreur rejet rapide:', error);
    res.status(500).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #dc3545;"> Erreur lors du rejet</h1>
        <p>Une erreur est survenue: ${error.message}</p>
        <a href="http://localhost:5173/admin/users" style="color: #007bff;">Retour au panneau admin</a>
      </div>
    `);
  }
});

module.exports = router;