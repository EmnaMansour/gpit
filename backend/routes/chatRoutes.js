const express = require('express');
const router = express.Router();
const { 
  callHuggingFaceImproved, 
  getQuickResponse, 
  generateSuggestions, 
  getIntelligentFallback,
  saveMessage 
} = require('../controllers/chatController');

// Route principale pour envoyer un message
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [], conversationId = null } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message requis' 
      });
    }

    console.log(` API Chat [${conversationId || 'new'}]:`, message.substring(0, 100));

    // Sauvegarder le message utilisateur
    await saveMessage(conversationId, 'user', message, {
      source: 'api',
      historyLength: conversationHistory.length
    });

    // 1) Vérifier les réponses rapides prédéfinies
    const quick = getQuickResponse(message);
    if (quick) {
      let finalText = quick.base;
      
      // Enrichissement IA optionnel (en API REST, on le fait léger)
      if (quick.enrich && quick.enrichPrompt) {
        const enriched = await callHuggingFaceImproved(quick.enrichPrompt, [])
          .catch(() => null);
        
        if (enriched && enriched.length > 15 && enriched.length < 150) {
          finalText = `${quick.base}\n\n💡 ${enriched}`;
        }
      }
      
      await saveMessage(conversationId, 'assistant', finalText, {
        source: 'quick_response',
        responseType: quick.key,
        enriched: !!quick.enrich,
        api: true
      });
      
      return res.json({ 
        success: true, 
        response: finalText, 
        suggestions: quick.suggestions, 
        source: 'quick',
        conversationId: conversationId || Date.now().toString()
      });
    }

    // 2) Appel à l'IA Hugging Face
    const aiResponse = await callHuggingFaceImproved(message, conversationHistory);
    
    if (aiResponse) {
      await saveMessage(conversationId, 'assistant', aiResponse, {
        source: 'hugging_face',
        api: true
      });
      
      return res.json({ 
        success: true, 
        response: aiResponse, 
        suggestions: generateSuggestions(message), 
        source: 'ai',
        conversationId: conversationId || Date.now().toString()
      });
    }

    // 3) Fallback intelligent
    const fallback = getIntelligentFallback(message, true);
    
    await saveMessage(conversationId, 'assistant', fallback.response, {
      source: 'intelligent_fallback',
      error: true,
      api: true
    });
    
    return res.json({ 
      success: true, 
      response: fallback.response, 
      suggestions: fallback.suggestions, 
      source: 'fallback',
      conversationId: conversationId || Date.now().toString()
    });

  } catch (err) {
    console.error(' Erreur /api/chat:', err.message);
    
    const errorFallback = getIntelligentFallback('', err.message);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur',
      response: errorFallback.response,
      suggestions: errorFallback.suggestions
    });
  }
});

// Récupérer l'historique d'une conversation
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const Message = require('../models/Message');
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .select('role content createdAt meta')
      .lean();
    
    const total = await Message.countDocuments({ conversationId });
    
    res.json({
      success: true,
      conversationId,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
        source: msg.meta?.source
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > (parseInt(offset) + messages.length)
      }
    });
    
  } catch (err) {
    console.error(' Erreur récupération historique:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération de l\'historique' 
    });
  }
});

// Supprimer une conversation
router.delete('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const Message = require('../models/Message');
    
    const result = await Message.deleteMany({ conversationId });
    
    res.json({
      success: true,
      message: 'Conversation supprimée',
      deletedCount: result.deletedCount
    });
    
  } catch (err) {
    console.error(' Erreur suppression conversation:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la suppression' 
    });
  }
});

// Récupérer toutes les conversations (pour admin)
router.get('/conversations', async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const Message = require('../models/Message');
    
    // Grouper par conversationId
    const conversations = await Message.aggregate([
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$content' },
          lastTimestamp: { $last: '$createdAt' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { lastTimestamp: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);
    
    const total = await Message.distinct('conversationId').then(ids => ids.length);
    
    res.json({
      success: true,
      conversations: conversations.map(conv => ({
        conversationId: conv._id,
        lastMessage: conv.lastMessage.substring(0, 100) + (conv.lastMessage.length > 100 ? '...' : ''),
        lastTimestamp: conv.lastTimestamp,
        messageCount: conv.messageCount
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (err) {
    console.error(' Erreur récupération conversations:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des conversations' 
    });
  }
});

// Tester les réponses rapides (debug)
router.get('/test-quick/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const quick = getQuickResponse(keyword);
    
    if (quick) {
      res.json({
        success: true,
        detected: true,
        keyword,
        response: quick
      });
    } else {
      res.json({
        success: true,
        detected: false,
        keyword,
        message: 'Aucune réponse rapide trouvée pour ce mot-clé'
      });
    }
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Test de l'IA (debug)
router.post('/test-ai', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message requis' 
      });
    }
    
    const startTime = Date.now();
    const response = await callHuggingFaceImproved(message, []);
    const duration = Date.now() - startTime;
    
    res.json({
      success: !!response,
      message,
      response: response || 'Aucune réponse générée',
      duration: duration + 'ms'
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Obtenir les suggestions pour un message
router.post('/suggestions', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message requis' 
      });
    }
    
    const suggestions = generateSuggestions(message);
    
    res.json({
      success: true,
      message,
      suggestions
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Health check spécifique au chatbot
router.get('/health', async (req, res) => {
  try {
    const { stats, responseCache } = require('../controllers/chatController');
    const Message = require('../models/Message');
    
    const totalMessages = await Message.countDocuments();
    const totalConversations = await Message.distinct('conversationId').then(ids => ids.length);
    
    res.json({
      success: true,
      status: 'healthy',
      stats: {
        ...stats,
        cacheSize: responseCache.size,
        hitRate: stats.totalRequests > 0 
          ? ((stats.cacheHits / stats.totalRequests) * 100).toFixed(2) + '%'
          : '0%'
      },
      database: {
        totalMessages,
        totalConversations
      },
      uptime: Math.floor(process.uptime()) + 's',
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router;