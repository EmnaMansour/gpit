const express = require('express');
const router = express.Router();
const Equipement = require('../models/Equipement');
const Affectation = require('../models/Affectation');
const Incident = require('../models/Incident');

// Route publique pour scanner un QR code par ID
router.get('/equipment/:id', async (req, res) => {
  try {
    const equipment = await Equipement.findById(req.params.id)
      .populate('fournisseur', 'nom email telephone')
      .populate('createdBy', 'nom prenom email');

    if (!equipment) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Équipement non trouvé</title>
            <style>
              body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
              .container { background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 500px; width: 100%; padding: 40px; text-align: center; }
              .icon { font-size: 80px; margin-bottom: 20px; }
              h1 { color: #e53e3e; margin: 0 0 10px 0; }
              p { color: #718096; font-size: 16px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>Équipement non trouvé</h1>
              <p>Aucun équipement ne correspond à ce QR code.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Récupérer les affectations
    const affectations = await Affectation.find({ equipement: equipment._id })
      .populate('utilisateur', 'nom prenom email')
      .sort({ dateAffectation: -1 })
      .limit(5);

    // Récupérer les incidents
    const incidents = await Incident.find({ equipement: equipment._id })
      .populate('rapportePar', 'nom prenom')
      .sort({ dateCreation: -1 })
      .limit(5);

    res.send(generateEquipmentHTML(equipment, affectations, incidents));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'équipement:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Erreur</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f7fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
            .container { background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 500px; width: 100%; padding: 40px; text-align: center; }
            h1 { color: #e53e3e; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Erreur serveur</h1>
            <p>Une erreur s'est produite lors de la récupération des données.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Route publique par numéro de série
router.get('/equipment/serial/:numeroSerie', async (req, res) => {
  try {
    const equipment = await Equipement.findOne({ numeroSerie: req.params.numeroSerie })
      .populate('fournisseur', 'nom email telephone')
      .populate('createdBy', 'nom prenom email');

    if (!equipment) {
      return res.status(404).send(generateNotFoundHTML());
    }

    const affectations = await Affectation.find({ equipement: equipment._id })
      .populate('utilisateur', 'nom prenom email')
      .sort({ dateAffectation: -1 })
      .limit(5);

    const incidents = await Incident.find({ equipement: equipment._id })
      .populate('rapportePar', 'nom prenom')
      .sort({ dateCreation: -1 })
      .limit(5);

    res.send(generateEquipmentHTML(equipment, affectations, incidents));
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).send(generateErrorHTML());
  }
});

// Route publique par nom
router.get('/equipment/name/:nom', async (req, res) => {
  try {
    const equipment = await Equipement.findOne({ nom: decodeURIComponent(req.params.nom) })
      .populate('fournisseur', 'nom email telephone')
      .populate('createdBy', 'nom prenom email');

    if (!equipment) {
      return res.status(404).send(generateNotFoundHTML());
    }

    const affectations = await Affectation.find({ equipement: equipment._id })
      .populate('utilisateur', 'nom prenom email')
      .sort({ dateAffectation: -1 })
      .limit(5);

    const incidents = await Incident.find({ equipement: equipment._id })
      .populate('rapportePar', 'nom prenom')
      .sort({ dateCreation: -1 })
      .limit(5);

    res.send(generateEquipmentHTML(equipment, affectations, incidents));
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).send(generateErrorHTML());
  }
});

// Fonction pour générer le HTML de l'équipement
function generateEquipmentHTML(equipment, affectations, incidents) {
  const statusColors = {
    'Disponible': '#48bb78',
    'En cours d\'utilisation': '#4299e1',
    'En panne': '#f56565',
    'En maintenance': '#ed8936'
  };

  const statusColor = statusColors[equipment.statut] || '#718096';

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${equipment.nom} - Détails</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
            animation: slideIn 0.5s ease-out;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 20px;
            background: ${statusColor};
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
          }
          .content {
            padding: 30px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 20px;
            color: #2d3748;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          }
          .info-item {
            background: #f7fafc;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
          }
          .info-label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 16px;
            color: #2d3748;
            font-weight: 600;
          }
          .list-item {
            background: #f7fafc;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            border-left: 4px solid #4299e1;
          }
          .list-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .list-item-title {
            font-weight: 600;
            color: #2d3748;
          }
          .list-item-date {
            font-size: 12px;
            color: #718096;
          }
          .list-item-content {
            font-size: 14px;
            color: #4a5568;
          }
          .empty-state {
            text-align: center;
            padding: 30px;
            color: #a0aec0;
          }
          .footer {
            background: #f7fafc;
            padding: 20px;
            text-align: center;
            color: #718096;
            font-size: 14px;
          }
          @media (max-width: 768px) {
            .info-grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 22px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 ${equipment.nom}</h1>
            <div class="status-badge">${equipment.statut}</div>
          </div>

          <div class="content">
            <!-- Informations principales -->
            <div class="section">
              <div class="section-title">
                📋 Informations principales
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Numéro de série</div>
                  <div class="info-value">${equipment.numeroSerie}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Type</div>
                  <div class="info-value">${equipment.type}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Marque</div>
                  <div class="info-value">${equipment.marque || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Modèle</div>
                  <div class="info-value">${equipment.modele || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Date d'achat</div>
                  <div class="info-value">${equipment.dateAchat ? new Date(equipment.dateAchat).toLocaleDateString('fr-FR') : 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Prix</div>
                  <div class="info-value">${equipment.prix ? equipment.prix + ' DT' : 'N/A'}</div>
                </div>
              </div>
            </div>

            ${equipment.specifications ? `
              <div class="section">
                <div class="section-title">
                  ⚙️ Spécifications techniques
                </div>
                <div class="info-item">
                  <div class="info-value">${equipment.specifications}</div>
                </div>
              </div>
            ` : ''}

            ${equipment.fournisseur ? `
              <div class="section">
                <div class="section-title">
                  🏢 Fournisseur
                </div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Nom</div>
                    <div class="info-value">${equipment.fournisseur.nom}</div>
                  </div>
                  ${equipment.fournisseur.email ? `
                    <div class="info-item">
                      <div class="info-label">Email</div>
                      <div class="info-value">${equipment.fournisseur.email}</div>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}

            <!-- Affectations récentes -->
            <div class="section">
              <div class="section-title">
                👤 Affectations récentes
              </div>
              ${affectations.length > 0 ? affectations.map(aff => `
                <div class="list-item">
                  <div class="list-item-header">
                    <div class="list-item-title">
                      ${aff.utilisateur ? `${aff.utilisateur.prenom} ${aff.utilisateur.nom}` : 'Utilisateur inconnu'}
                    </div>
                    <div class="list-item-date">
                      ${new Date(aff.dateAffectation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  ${aff.utilisateur?.email ? `
                    <div class="list-item-content">
                      📧 ${aff.utilisateur.email}
                    </div>
                  ` : ''}
                </div>
              `).join('') : '<div class="empty-state">Aucune affectation enregistrée</div>'}
            </div>

            <!-- Incidents récents -->
            <div class="section">
              <div class="section-title">
                ⚠️ Incidents récents
              </div>
              ${incidents.length > 0 ? incidents.map(inc => `
                <div class="list-item" style="border-left-color: ${inc.statut === 'Résolu' ? '#48bb78' : '#f56565'};">
                  <div class="list-item-header">
                    <div class="list-item-title">${inc.titre}</div>
                    <div class="list-item-date">
                      ${new Date(inc.dateCreation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div class="list-item-content">
                    ${inc.description}<br>
                    <strong>Statut:</strong> ${inc.statut}
                  </div>
                </div>
              `).join('') : '<div class="empty-state">Aucun incident enregistré</div>'}
            </div>
          </div>

          <div class="footer">
            🔍 Scanné le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
            Système de gestion de parc informatique GPIT
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateNotFoundHTML() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Équipement non trouvé</title>
        <style>
          body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
          .container { background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 500px; width: 100%; padding: 40px; text-align: center; }
          .icon { font-size: 80px; margin-bottom: 20px; }
          h1 { color: #e53e3e; margin: 0 0 10px 0; }
          p { color: #718096; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">❌</div>
          <h1>Équipement non trouvé</h1>
          <p>Aucun équipement ne correspond à ce QR code.</p>
        </div>
      </body>
    </html>
  `;
}

function generateErrorHTML() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erreur</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f7fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
          .container { background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 500px; width: 100%; padding: 40px; text-align: center; }
          h1 { color: #e53e3e; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Erreur serveur</h1>
          <p>Une erreur s'est produite lors de la récupération des données.</p>
        </div>
      </body>
    </html>
  `;
}

module.exports = router;