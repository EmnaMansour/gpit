"use strict";
const PDFDocument = require('pdfkit');
const Incident = require('../models/Incident');
const Equipement = require('../models/Equipement');
const Maintenance = require('../models/maintenance');
const moment = require('moment');
const generateReport = async (req, res) => {
    console.log('[REPORT] ========== DÉBUT GÉNÉRATION RAPPORT ==========');
    console.log('[REPORT] Données reçues:', JSON.stringify(req.body, null, 2));
    console.log('[REPORT] User:', req.user ? req.user.id : 'Non authentifié');
    const { reportType, dateRange } = req.body;
    // Validation des paramètres
    if (!reportType || !dateRange) {
        console.log('[REPORT] ❌ Paramètres manquants:', { reportType, dateRange });
        return res.status(400).json({
            message: "Les paramètres reportType et dateRange sont requis.",
            received: { reportType, dateRange }
        });
    }
    // Validation des valeurs
    const validReportTypes = ['incidents', 'equipment', 'maintenance'];
    const validDateRanges = ['week', 'month', 'quarter', 'year'];
    if (!validReportTypes.includes(reportType)) {
        console.log('[REPORT] ❌ Type de rapport invalide:', reportType);
        return res.status(400).json({
            message: "Type de rapport non valide.",
            validTypes: validReportTypes,
            received: reportType
        });
    }
    if (!validDateRanges.includes(dateRange)) {
        console.log('[REPORT] ❌ Période invalide:', dateRange);
        return res.status(400).json({
            message: "Période non valide.",
            validRanges: validDateRanges,
            received: dateRange
        });
    }
    try {
        const dateFilter = getDateFilter(dateRange);
        console.log('[REPORT] ✅ Filtre de date calculé:', {
            range: dateRange,
            filterDate: moment(dateFilter).format('DD/MM/YYYY HH:mm'),
            filterTimestamp: dateFilter
        });
        let data = [];
        let collectionName = '';
        // CORRECTION: Requêtes séparées avec populate conditionnel
        console.log('[REPORT] 🔍 Type de rapport:', reportType);
        try {
            if (reportType === 'incidents') {
                console.log('[REPORT] 🔍 Recherche des incidents...');
                collectionName = 'incidents';
                // Récupérer d'abord les données sans populate
                data = await Incident.find({
                    createdAt: { $gte: dateFilter }
                }).lean().exec();
                console.log(`[REPORT] ✅ ${data.length} incidents trouvés (sans populate)`);
                // Essayer de populer si possible
                try {
                    data = await Incident.find({
                        createdAt: { $gte: dateFilter }
                    })
                        .populate('equipement')
                        .populate('user')
                        .lean()
                        .exec();
                    console.log('[REPORT] ✅ Populate réussi pour incidents');
                }
                catch (populateError) {
                    console.warn('[REPORT] ⚠️ Populate échoué, utilisation des données de base:', populateError.message);
                    // On garde les données sans populate
                }
            }
            else if (reportType === 'equipment') {
                console.log('[REPORT] 🔍 Recherche des équipements...');
                collectionName = 'équipements';
                // Récupérer d'abord les données sans populate
                data = await Equipement.find({
                    createdAt: { $gte: dateFilter }
                }).lean().exec();
                console.log(`[REPORT] ✅ ${data.length} équipements trouvés (sans populate)`);
                // Essayer de populer si possible
                try {
                    data = await Equipement.find({
                        createdAt: { $gte: dateFilter }
                    })
                        .populate('user')
                        .lean()
                        .exec();
                    console.log('[REPORT] ✅ Populate réussi pour équipements');
                }
                catch (populateError) {
                    console.warn('[REPORT] ⚠️ Populate échoué, utilisation des données de base:', populateError.message);
                }
            }
            else if (reportType === 'maintenance') {
                console.log('[REPORT] 🔍 Recherche des maintenances...');
                collectionName = 'maintenances';
                // Récupérer d'abord les données sans populate
                data = await Maintenance.find({
                    createdAt: { $gte: dateFilter }
                }).lean().exec();
                console.log(`[REPORT] ✅ ${data.length} maintenances trouvées (sans populate)`);
                // Essayer de populer si possible
                try {
                    data = await Maintenance.find({
                        createdAt: { $gte: dateFilter }
                    })
                        .populate('equipement')
                        .populate('technicien')
                        .lean()
                        .exec();
                    console.log('[REPORT] ✅ Populate réussi pour maintenances');
                }
                catch (populateError) {
                    console.warn('[REPORT] ⚠️ Populate échoué, utilisation des données de base:', populateError.message);
                }
            }
            console.log(`[REPORT] ✅ Total: ${data.length} éléments trouvés`);
            // Log du premier élément pour debug
            if (data.length > 0) {
                console.log('[REPORT] 📝 Premier élément (sample):', {
                    type: reportType,
                    keys: Object.keys(data[0]),
                    hasCreatedAt: !!data[0].createdAt
                });
            }
        }
        catch (dbError) {
            console.error('[REPORT] ❌ Erreur de base de données:', dbError.message);
            console.error('[REPORT] ❌ Stack:', dbError.stack);
            throw new Error(`Erreur lors de la requête base de données: ${dbError.message}`);
        }
        console.log('[REPORT] 📄 Création du PDF...');
        // Création du PDF avec gestion d'erreur
        let doc;
        try {
            doc = new PDFDocument({
                margin: 50,
                size: 'A4',
                bufferPages: true
            });
        }
        catch (pdfError) {
            console.error('[REPORT] ❌ Erreur création PDFDocument:', pdfError);
            throw new Error(`Erreur lors de la création du document PDF: ${pdfError.message}`);
        }
        const filename = `${reportType}_report_${Date.now()}.pdf`;
        // Configuration des headers AVANT de pipe
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        // Gestion des erreurs du stream
        doc.on('error', (error) => {
            console.error('[REPORT] ❌ Erreur PDF stream:', error);
        });
        // Pipe vers la réponse
        doc.pipe(res);
        // ==================== CONSTRUCTION DU PDF ====================
        // En-tête du rapport
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .text('RAPPORT DE GESTION', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16)
            .text(`Type: ${getReportTitle(reportType)}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12)
            .font('Helvetica');
        doc.text(`Période : ${getDateRangeLabel(dateRange)}`);
        doc.text(`Date de génération : ${moment().format('DD/MM/YYYY HH:mm')}`);
        doc.text(`Nombre d'éléments : ${data.length}`);
        doc.moveDown();
        // Ligne de séparation
        doc.moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .strokeColor('#000000')
            .stroke();
        doc.moveDown();
        if (data.length === 0) {
            console.log('[REPORT] ⚠️ Aucune donnée trouvée');
            doc.fontSize(14)
                .text('Aucune donnée trouvée pour cette période.', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12)
                .text('Suggestions:', { underline: true });
            doc.text('• Vérifiez la période sélectionnée');
            doc.text('• Assurez-vous que des données existent dans la base');
            doc.text(`• Le filtre appliqué : date >= ${moment(dateFilter).format('DD/MM/YYYY')}`);
        }
        else {
            console.log('[REPORT] ✍️ Écriture des données dans le PDF...');
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text(`Liste des ${collectionName}:`, { underline: true });
            doc.moveDown();
            doc.fontSize(12).font('Helvetica');
            data.forEach((item, index) => {
                // Nouvelle page si nécessaire (laisser 100px pour le footer)
                if (doc.y > 700) {
                    doc.addPage();
                }
                const itemNumber = `${index + 1}.`;
                try {
                    if (reportType === 'incidents') {
                        doc.font('Helvetica-Bold')
                            .text(`${itemNumber} ${item.title || item.titre || 'Titre non défini'}`);
                        doc.font('Helvetica');
                        doc.text(`   Statut: ${item.status || item.statut || 'Non défini'}`);
                        doc.text(`   Priorité: ${item.priorite || item.priority || 'Non définie'}`);
                        if (item.description) {
                            const desc = item.description.substring(0, 100);
                            doc.text(`   Description: ${desc}${item.description.length > 100 ? '...' : ''}`);
                        }
                        // Gestion sécurisée de l'équipement (peut être un objet ou un ID)
                        if (item.equipement) {
                            if (typeof item.equipement === 'object' && item.equipement.name) {
                                doc.text(`   Équipement: ${item.equipement.name || item.equipement.nom}`);
                            }
                            else if (typeof item.equipement === 'string') {
                                doc.text(`   Équipement ID: ${item.equipement}`);
                            }
                        }
                        if (item.createdAt) {
                            doc.text(`   Date: ${moment(item.createdAt).format('DD/MM/YYYY HH:mm')}`);
                        }
                    }
                    else if (reportType === 'equipment') {
                        doc.font('Helvetica-Bold')
                            .text(`${itemNumber} ${item.name || item.nom || 'Nom non défini'}`);
                        doc.font('Helvetica');
                        doc.text(`   Statut: ${item.status || item.statut || 'Non défini'}`);
                        doc.text(`   Type: ${item.type || 'Non défini'}`);
                        doc.text(`   Marque: ${item.marque || item.brand || 'Non définie'}`);
                        if (item.numeroSerie || item.serialNumber) {
                            doc.text(`   N° Série: ${item.numeroSerie || item.serialNumber}`);
                        }
                        if (item.createdAt) {
                            doc.text(`   Date: ${moment(item.createdAt).format('DD/MM/YYYY HH:mm')}`);
                        }
                    }
                    else if (reportType === 'maintenance') {
                        doc.font('Helvetica-Bold')
                            .text(`${itemNumber} ${item.type || 'Type non défini'}`);
                        doc.font('Helvetica');
                        doc.text(`   Statut: ${item.status || item.statut || 'Non défini'}`);
                        doc.text(`   Impact: ${item.impact || 'Non défini'}`);
                        if (item.description) {
                            const desc = item.description.substring(0, 100);
                            doc.text(`   Description: ${desc}${item.description.length > 100 ? '...' : ''}`);
                        }
                        // Gestion sécurisée de l'équipement
                        if (item.equipement) {
                            if (typeof item.equipement === 'object' && item.equipement.name) {
                                doc.text(`   Équipement: ${item.equipement.name || item.equipement.nom}`);
                            }
                            else if (typeof item.equipement === 'string') {
                                doc.text(`   Équipement ID: ${item.equipement}`);
                            }
                        }
                        if (item.createdAt) {
                            doc.text(`   Date: ${moment(item.createdAt).format('DD/MM/YYYY HH:mm')}`);
                        }
                    }
                    doc.moveDown(0.5);
                    // Ligne de séparation entre les éléments
                    doc.moveTo(50, doc.y)
                        .lineTo(550, doc.y)
                        .strokeColor('#CCCCCC')
                        .stroke()
                        .strokeColor('#000000'); // Reset couleur
                    doc.moveDown(0.5);
                }
                catch (itemError) {
                    console.error(`[REPORT] ⚠️ Erreur sur l'item ${index}:`, itemError.message);
                    // Continuer avec les autres items
                }
            });
            console.log('[REPORT] ✅ Données écrites dans le PDF');
        }
        // Pied de page
        console.log('[REPORT] 📝 Ajout des pieds de page...');
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
            doc.switchToPage(i);
            doc.fontSize(8)
                .text(`Page ${i + 1} sur ${totalPages} - Généré le ${moment().format('DD/MM/YYYY HH:mm')}`, 50, doc.page.height - 30, { align: 'center' });
        }
        console.log('[REPORT] ✅ PDF finalisé, envoi au client...');
        // Finaliser le document
        doc.end();
        console.log('[REPORT] ========== FIN GÉNÉRATION RAPPORT ==========');
    }
    catch (error) {
        console.error('[REPORT] ❌❌❌ ERREUR CRITIQUE ❌❌❌');
        console.error('[REPORT] Message:', error.message);
        console.error('[REPORT] Stack:', error.stack);
        console.error('[REPORT] Type:', error.name);
        // Si les headers n'ont pas été envoyés, renvoyer une erreur JSON
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Erreur lors de la génération du rapport.",
                error: error.message,
                type: error.name,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
        else {
            // Si les headers ont été envoyés, on ne peut plus répondre
            console.error('[REPORT] ⚠️ Headers déjà envoyés, impossible de renvoyer une erreur JSON');
        }
    }
};
// NOUVELLE FONCTION : Récupération des rapports (GET)
const getReports = async (req, res) => {
    console.log('[GET REPORTS] ========== DÉBUT RÉCUPÉRATION RAPPORTS ==========');
    console.log('[GET REPORTS] User:', req.user ? req.user.id : 'Non authentifié');
    try {
        // Données mock pour les rapports - À remplacer par vos données réelles plus tard
        const mockReports = [
            {
                id: 1,
                title: 'Rapport des incidents - Mois dernier',
                type: 'incidents',
                dateRange: 'month',
                generatedAt: new Date().toISOString(),
                dataCount: 15,
                status: 'completed'
            },
            {
                id: 2,
                title: 'Rapport des équipements - Semaine dernière',
                type: 'equipment',
                dateRange: 'week',
                generatedAt: new Date(Date.now() - 86400000).toISOString(),
                dataCount: 8,
                status: 'completed'
            },
            {
                id: 3,
                title: 'Rapport des maintenances - Trimestre dernier',
                type: 'maintenance',
                dateRange: 'quarter',
                generatedAt: new Date(Date.now() - 172800000).toISOString(),
                dataCount: 23,
                status: 'completed'
            }
        ];
        console.log(`[GET REPORTS] ✅ ${mockReports.length} rapports retournés`);
        res.json({
            success: true,
            data: mockReports,
            message: 'Rapports récupérés avec succès',
            count: mockReports.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[GET REPORTS] ❌ Erreur:', error.message);
        console.error('[GET REPORTS] ❌ Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des rapports',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
// Fonction getDateFilter corrigée
const getDateFilter = (range) => {
    let filterDate;
    switch (range) {
        case 'week':
            filterDate = moment().subtract(7, 'days').toDate();
            break;
        case 'month':
            filterDate = moment().subtract(1, 'month').toDate();
            break;
        case 'quarter':
            filterDate = moment().subtract(3, 'months').toDate();
            break;
        case 'year':
            filterDate = moment().subtract(1, 'year').toDate();
            break;
        default:
            console.warn(`[REPORT] ⚠️ Date range inconnu: ${range}, utilisation de 'month' par défaut`);
            filterDate = moment().subtract(1, 'month').toDate();
    }
    console.log(`[REPORT] Date filter pour "${range}":`, moment(filterDate).format('DD/MM/YYYY'));
    return filterDate;
};
const getReportTitle = (reportType) => {
    const titles = {
        'incidents': 'Incidents',
        'equipment': 'Équipements',
        'maintenance': 'Maintenances'
    };
    return titles[reportType] || 'Rapport';
};
const getDateRangeLabel = (range) => {
    const labels = {
        'week': 'Semaine dernière',
        'month': 'Mois dernier',
        'quarter': 'Trimestre dernier',
        'year': 'Année dernière'
    };
    return labels[range] || 'Période non définie';
};
// EXPORTEZ LES DEUX FONCTIONS
module.exports = {
    generateReport,
    getReports // ← N'OUBLIEZ PAS D'AJOUTER CETTE LIGNE
};
