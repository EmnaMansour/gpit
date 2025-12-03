const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('node:path');
const http = require('node:http');
const fs = require('node:fs');
const qrScanRoutes = require('./routes/qrScanRoutes');



// 🔧 Chargement dynamique de l'environnement
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
  console.log('  Environnement local détecté (.env.local)');
} else {
  dotenv.config();
  console.log('  Environnement Docker/production (.env)');
}

const app = express();
const PORT = process.env.PORT || 8000;

// --- Import des routes ---
const userRoutes = require('./routes/userRoutes');
const equipementRoutes = require('./routes/equipementRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboard = require('./routes/dashboard');
const affectationRoutes = require('./routes/affectationRoutes');
const contactRoutes = require('./routes/contacts');
const chatRoutes = require('./routes/chatRoutes');

const { sendVerificationEmail, sendIncidentNotification } = require('./config/email');
const { attachSocket } = require('./controllers/chatController');

const server = http.createServer(app);

// --- WebSocket Configuration ---
let io;
try {
  const configureWebSocket = require('./config/socket');
  io = configureWebSocket(server);
  attachSocket(io);
  console.log(' Socket.io + Chatbot configurés');
} catch (error) {
  console.warn(' WebSocket désactivé:', error.message);
}

if (io) app.set('io', io);

app.set('sendVerificationEmail', sendVerificationEmail);
app.set('sendIncidentNotification', sendIncidentNotification);

// --- CORS ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174' , 'http://44.210.225.211/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Connexion MongoDB ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestion_parc')
  .then(() => console.log(' MongoDB connecté'))
  .catch(err => {
    console.error(' Erreur MongoDB :', err);
    process.exit(1);
  });

// --- Routes principales ---
app.use('/api/affectations', affectationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipements', equipementRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/utilisateur', utilisateurRoutes);
app.use('/api/dashboard', dashboard);
app.use('/api/reports', reportRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', require('./routes/quickActions')); // Ajoutez cette ligne
app.use('/scan', qrScanRoutes);  // Route PUBLIQUE pour scanner les QR codes

// --- Fichiers statiques ---
app.use('/qrCodes', express.static(path.join(__dirname, 'qrCodes')));

// --- Route publique Health Check ---
app.get('/api/health', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const mongoStatus = {
      0: ' Déconnecté',
      1: ' Connecté',
      2: ' Connexion en cours',
      3: ' Déconnexion en cours'
    }[state] || ' Inconnu';

    const { stats } = require('./controllers/chatController');

    res.json({
      status: 'OK',
      version: '4.1',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()) + 's',
      services: {
        mongodb: mongoStatus,
        websocket: !!io,
        chatbot: {
          enabled: true,
          stats: stats
        }
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Erreur', 
      error: error.message 
    });
  }
});

// --- Stats Chatbot ---
app.get('/api/chat/stats', (req, res) => {
  try {
    const { stats, responseCache } = require('./controllers/chatController');
    res.json({
      success: true,
      stats: {
        ...stats,
        cacheSize: responseCache.size,
        hitRate: stats.totalRequests > 0 
          ? ((stats.cacheHits / stats.totalRequests) * 100).toFixed(2) + '%'
          : '0%'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// --- Page d'accueil ---
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    name: 'Backend GPIT',
    version: '4.1',
    features: [
      'Gestion parc informatique',
      'Chatbot IA intelligent',
      'WebSocket temps réel',
      'API REST complète'
    ],
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      chatStats: '/api/chat/stats',
      users: '/api/users',
      equipements: '/api/equipements',
      incidents: '/api/incidents',
      dashboard: '/api/dashboard'
    }
  });
});

// --- Gestion des erreurs 404 ---
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method
  });
});

// --- Gestion des erreurs globales ---
app.use((err, req, res, next) => {
  console.error(' Erreur serveur:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// --- Démarrage du serveur ---
if (require.main == module) {
server.listen(PORT, '0.0.0.0', () => {
    console.log(' BACKEND GPIT v4.1 - DÉMARRÉ');
  console.log(` Serveur: http://0.0.0.0:${PORT}`);
    console.log(` Chatbot IA: ${io ? ' Actif' : ' Désactivé'}`);
//    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Service email: ${process.env.EMAIL_USER ? 'Gmail' : 'Ethereal (Test)'}`);
    console.log(` Actions rapides: http://localhost:${PORT}/api/users/quick-approve/:id`);
    console.log(` Actions rapides: http://localhost:${PORT}/api/users/quick-reject/:id`);
  });
}

// --- Arrêt propre ---
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  
  if (io) {
    io.close(() => {
      console.log(' WebSocket fermé');
    });
  }
  
  await mongoose.connection.close();
  console.log(' MongoDB déconnecté');
  
  server.close(() => {
    console.log('Serveur HTTP fermé');
    process.exit(0);
  });
});

module.exports = { app, server, io };
