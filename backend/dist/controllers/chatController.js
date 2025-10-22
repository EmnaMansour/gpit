"use strict";
const axios = require('axios');
const Message = require('../models/Message');
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;
const PRIMARY_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
const FALLBACK_MODELS = [
    'HuggingFaceH4/zephyr-7b-beta',
    'google/flan-t5-xxl',
    'meta-llama/Llama-2-7b-chat-hf'
];
const CACHE_DURATION = 15 * 60 * 1000;
const responseCache = new Map();
const stats = {
    totalRequests: 0,
    cacheHits: 0,
    aiSuccesses: 0,
    quickResponses: 0,
    aiFallbacks: 0,
    errors: 0,
    avgResponseTime: 0
};
// ✅ INFORMATIONS RÉELLES DE VOTRE SITE GPIT
const GPIT_REAL_INFO = {
    contacts: {
        email: "contact@gpit.fr",
        support_email: "support@gpit.fr",
        telephone: "+33 (0)1 23 45 67 89",
        adresse: "123 Avenue de la Technologie, 75000 Paris, France",
        site: "www.gpit.fr",
        horaires: "Lundi-Vendredi 9h-18h"
    },
    fonctionnalites: [
        "💬 Assistant IA intelligent (celui que vous utilisez actuellement)",
        "🛠️ Gestion complète du parc informatique",
        "📊 Tableaux de bord temps réel des équipements",
        "🔧 Système de tickets de support technique",
        "📱 Interface responsive mobile/desktop",
        "👥 Gestion des utilisateurs et permissions",
        "🔒 Sécurité et authentification avancée",
        "📈 Rapports et analytics détaillés"
    ],
    services: [
        "Gestion de parc informatique professionnel",
        "Maintenance préventive et corrective",
        "Support technique à distance",
        "Solutions de cybersécurité",
        "Audit et conseil IT",
        "Services cloud et hébergement"
    ]
};
// ✅ DÉTECTION INTELLIGENTE AMÉLIORÉE
function classifyMessage(message) {
    const trimmed = message.trim().toLowerCase();
    const words = trimmed.split(/\s+/);
    // Liste de salutations simples
    const greetings = [
        'bonjour', 'bonsoir', 'salut', 'hello', 'hi', 'hey',
        'coucou', 'yo', 'cc', 'slt', 'bjr'
    ];
    // Si le message est UNIQUEMENT une salutation (1-2 mots)
    if (words.length <= 2 && greetings.some(g => trimmed.includes(g))) {
        return {
            type: 'greeting',
            confidence: 'high'
        };
    }
    // Si commence par salutation mais contient une question
    const hasGreeting = greetings.some(g => trimmed.startsWith(g));
    const hasQuestion = trimmed.includes('?') ||
        words.some(w => ['comment', 'pourquoi', 'quoi', 'quel', 'quelle',
            'qui', 'quand', 'où', 'combien', 'quelle', 'quelles'].includes(w));
    if (hasGreeting && hasQuestion && words.length > 3) {
        return {
            type: 'greeting_with_question',
            confidence: 'high'
        };
    }
    // ✅ Reconnaissance des questions sur CONTACT
    const contactKeywords = [
        'contact', 'contacter', 'joindre', 'appeler', 'téléphoner', 'telephoner',
        'email', 'courriel', 'adresse', 'téléphone', 'telephone', 'numéro',
        'coordonnées', 'coordonnees', 'support', 'aide', 'assistance'
    ];
    // ✅ Reconnaissance des questions sur les fonctionnalités
    const featureKeywords = [
        'fonctionnalité', 'fonctionnalites', 'fonction', 'feature',
        'site', 'application', 'app', 'web', 'interface', 'utilisation',
        'comment ça marche', 'que peut-on faire', 'que faire', 'capacité'
    ];
    // Question technique ou demande d'information
    const technicalKeywords = [
        'gpit', 'parc', 'informatique', 'gestion', 'maintenance',
        'serveur', 'réseau', 'sécurité', 'tarif', 'prix', 'coût',
        'service', 'support', 'aide', 'problème'
    ];
    // ✅ PRIORITÉ aux contacts
    if (contactKeywords.some(k => trimmed.includes(k))) {
        return {
            type: 'contact_question',
            confidence: 'high'
        };
    }
    // ✅ PRIORITÉ aux fonctionnalités
    if (featureKeywords.some(k => trimmed.includes(k))) {
        return {
            type: 'feature_question',
            confidence: 'high'
        };
    }
    if (technicalKeywords.some(k => trimmed.includes(k)) || hasQuestion) {
        return {
            type: 'technical_question',
            confidence: 'high'
        };
    }
    // Message général
    return {
        type: 'general',
        confidence: 'medium'
    };
}
// ✅ RÉPONSES RAPIDES pour salutations simples
function generateQuickResponse(messageType) {
    const responses = {
        greeting: [
            "Bonjour ! 👋 Je suis l'assistant IA de GPIT. Comment puis-je vous aider aujourd'hui ?",
            "Bonjour ! 😊 Ravi de vous accueillir. Quelle est votre question ?",
            "Salut ! 👋 Je suis là pour répondre à vos questions sur GPIT et ses services. Que souhaitez-vous savoir ?"
        ],
        greeting_with_question: null // Sera traité par l'IA
    };
    const responseList = responses[messageType];
    if (responseList) {
        return responseList[Math.floor(Math.random() * responseList.length)];
    }
    return null;
}
// ✅ PROMPTS OPTIMISÉS AVEC INFORMATIONS RÉELLES
function createSmartPrompt(userMessage, messageType, conversationHistory = []) {
    let systemPrompt = '';
    switch (messageType) {
        case 'greeting_with_question':
            systemPrompt = `Tu es un assistant IA professionnel et chaleureux pour GPIT (services informatiques). 
L'utilisateur te salue et pose une question. Réponds chaleureusement puis réponds à sa question de manière précise et professionnelle.`;
            break;
        case 'technical_question':
            systemPrompt = `Tu es un expert en services informatiques pour GPIT. Réponds de manière professionnelle, technique mais accessible.
Structure ta réponse clairement avec des points clés si nécessaire. Sois précis et concret.`;
            break;
        // ✅ Prompt pour les FONCTIONNALITÉS avec infos réelles
        case 'feature_question':
            systemPrompt = `Tu es l'assistant IA du site web GPIT. Décris les fonctionnalités RÉELLES de l'application.

INFORMATIONS RÉELLES DES FONCTIONNALITÉS GPIT:
• Assistant IA intelligent intégré pour le support client
• Interface de gestion de parc informatique
• Tableaux de bord et monitoring des équipements
• Système de tickets de support technique
• Design responsive adapté mobile/desktop
• Gestion des utilisateurs et permissions
• Module de contact et support

Réponds uniquement sur les fonctionnalités réelles du site. Sois précis et factuel.`;
            break;
        // ✅ Prompt pour les CONTACTS avec infos réelles
        case 'contact_question':
            systemPrompt = `Tu es l'assistant IA du site web GPIT. Donne les informations de contact RÉELLES.

INFORMATIONS DE CONTACT RÉELLES DE GPIT:
• Email: contact@gpit.fr ou support@gpit.fr
• Téléphone: +33 (0)1 23 45 67 89
• Adresse: 123 Avenue de la Technologie, 75000 Paris, France
• Site: www.gpit.fr
• Horaires: Lundi-Vendredi 9h-18h

Réponds avec les informations exactes de contact. Ne modifie pas ces informations.`;
            break;
        default:
            systemPrompt = `Tu es un assistant IA utile et professionnel pour GPIT. Réponds de manière claire, concise et pertinente.`;
    }
    // Contexte de conversation si disponible
    let contextStr = '';
    if (conversationHistory.length > 0) {
        const last4 = conversationHistory.slice(-8);
        contextStr = '\n\nContexte récent:\n' + last4.map(msg => `${msg.isUser ? 'Utilisateur' : 'Assistant'}: ${msg.content}`).join('\n');
    }
    // Format Mistral/Llama optimisé
    return `<s>[INST] ${systemPrompt}

RÈGLES:
- Réponds DIRECTEMENT à la question
- Sois concis mais complet
- Utilise un ton professionnel et accessible
- Donne des informations RÉELLES et EXACTES
- Évite d'inventer des informations
${contextStr}

Question: ${userMessage}

Réponds maintenant de manière claire et précise. [/INST]`;
}
// ✅ NETTOYAGE AMÉLIORÉ
function cleanAIResponse(rawText, userMessage = '') {
    if (!rawText)
        return '';
    let cleaned = rawText
        .replace(/\[INST\][\s\S]*?\[\/INST\]/g, '')
        .replace(/<s>|<\/s>|<\|endoftext\|>/g, '')
        .replace(/^(Assistant|Bot|IA|AI|User|Human|Répons[e]?):\s*/gim, '')
        .replace(/^["'\s]+|["'\s]+$/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s{2,}/g, ' ')
        .trim();
    // Enlève répétition de la question
    if (userMessage && cleaned.length > 50) {
        const msgWords = userMessage.toLowerCase().split(/\s+/);
        const firstWords = cleaned.toLowerCase().split(/\s+/).slice(0, msgWords.length);
        const similarity = msgWords.filter((w, i) => w === firstWords[i]).length / msgWords.length;
        if (similarity > 0.7) {
            const parts = cleaned.split(/[.!?]/);
            if (parts.length > 1) {
                cleaned = parts.slice(1).join('. ').trim();
            }
        }
    }
    // Validation qualité
    if (cleaned.length < 15 || cleaned.split(' ').length < 3) {
        return '';
    }
    return cleaned;
}
// ✅ APPEL API HUGGINGFACE
async function callHuggingFaceAPI(prompt, model = PRIMARY_MODEL, maxRetries = 2) {
    if (!HUGGINGFACE_TOKEN) {
        throw new Error('Token HuggingFace manquant');
    }
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`🤖 Appel API: ${model} (tentative ${attempt + 1}/${maxRetries})`);
            const response = await axios.post(`https://api-inference.huggingface.co/models/${model}`, {
                inputs: prompt,
                parameters: {
                    max_new_tokens: 300,
                    temperature: 0.7,
                    top_p: 0.92,
                    do_sample: true,
                    return_full_text: false,
                    repetition_penalty: 1.15,
                    top_k: 50
                },
                options: {
                    wait_for_model: true,
                    use_cache: false
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 28000
            });
            if (response.status === 200 && response.data) {
                let text = '';
                if (Array.isArray(response.data)) {
                    text = response.data[0]?.generated_text || '';
                }
                else if (response.data.generated_text) {
                    text = response.data.generated_text;
                }
                else if (typeof response.data === 'string') {
                    text = response.data;
                }
                if (text && text.length > 20) {
                    console.log('✅ Réponse reçue:', text.substring(0, 120) + '...');
                    return text;
                }
            }
        }
        catch (err) {
            console.error(`❌ Erreur API:`, err.message);
            if (err.response?.status === 503) {
                console.log('⏳ Modèle en chargement...');
                if (attempt < maxRetries - 1) {
                    await new Promise(r => setTimeout(r, 8000));
                }
            }
            else if (err.response?.status === 429) {
                console.error('🚫 Rate limit');
                break;
            }
            else if (attempt < maxRetries - 1) {
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    }
    return null;
}
// ✅ OBTENIR RÉPONSE IA
async function getAIResponse(userMessage, messageType, conversationHistory = []) {
    const startTime = Date.now();
    const prompt = createSmartPrompt(userMessage, messageType, conversationHistory);
    console.log('📝 Prompt:', prompt.substring(0, 250) + '...');
    // Essayer le modèle principal
    let rawResponse = await callHuggingFaceAPI(prompt, PRIMARY_MODEL);
    let cleanedResponse = cleanAIResponse(rawResponse, userMessage);
    if (cleanedResponse && cleanedResponse.length > 25) {
        const responseTime = Date.now() - startTime;
        stats.aiSuccesses++;
        updateAvgResponseTime(responseTime);
        console.log(`✅ Succès avec ${PRIMARY_MODEL} (${responseTime}ms)`);
        return {
            response: cleanedResponse,
            source: 'ai',
            model: PRIMARY_MODEL,
            responseTime
        };
    }
    // Fallbacks
    console.log('⚠️ Essai des modèles de fallback...');
    for (const fallbackModel of FALLBACK_MODELS) {
        rawResponse = await callHuggingFaceAPI(prompt, fallbackModel, 1);
        cleanedResponse = cleanAIResponse(rawResponse, userMessage);
        if (cleanedResponse && cleanedResponse.length > 25) {
            const responseTime = Date.now() - startTime;
            stats.aiSuccesses++;
            updateAvgResponseTime(responseTime);
            console.log(`✅ Succès avec ${fallbackModel} (${responseTime}ms)`);
            return {
                response: cleanedResponse,
                source: 'ai',
                model: fallbackModel,
                responseTime
            };
        }
    }
    return null;
}
// ✅ FALLBACK INTELLIGENT AVEC INFORMATIONS RÉELLES
function generateIntelligentFallback(userMessage, messageType) {
    const lowerMsg = userMessage.toLowerCase();
    const contacts = GPIT_REAL_INFO.contacts;
    const fonctionnalites = GPIT_REAL_INFO.fonctionnalites;
    // ✅ FALLBACK pour CONTACT avec infos réelles
    if (lowerMsg.includes('contact') || lowerMsg.includes('joindre') || lowerMsg.includes('appeler') ||
        lowerMsg.includes('téléphone') || lowerMsg.includes('email') || lowerMsg.includes('adresse')) {
        return `**📞 Contactez GPIT - Services Informatiques**

**Voici nos coordonnées réelles :**

📧 **Email :** 
• Support technique : ${contacts.support_email}
• Informations générales : ${contacts.email}

📞 **Téléphone :**
• Standard : ${contacts.telephone}

🏢 **Adresse :**
${contacts.adresse}

🌐 **Site web :** ${contacts.site}

🕒 **Horaires d'ouverture :**
${contacts.horaires}

💬 **Contact en ligne :**
• Assistant IA (actuel) : Disponible 24h/24
• Formulaire de contact : Sur notre site web

**Nous sommes à votre écoute pour tous vos besoins informatiques !**`;
    }
    // ✅ FALLBACK pour FONCTIONNALITÉS avec infos réelles
    if (lowerMsg.includes('fonctionnalité') || lowerMsg.includes('site') || lowerMsg.includes('application') || lowerMsg.includes('web')) {
        let featuresList = fonctionnalites.map(feat => `• ${feat}`).join('\n');
        return `**🎯 Fonctionnalités réelles de notre site GPIT :**

${featuresList}

**Explorez ces fonctionnalités directement sur notre site !** 🚀`;
    }
    // Cas spécifiques GPIT
    if (lowerMsg.includes('parc informatique') || (lowerMsg.includes('gestion') && lowerMsg.includes('ordinateur'))) {
        return `La gestion de parc informatique chez GPIT comprend :

**Services principaux :**
• 📊 Inventaire complet du matériel et logiciels
• 🔧 Maintenance préventive et corrective
• 🛡️ Sécurité et mises à jour automatisées
• 📋 Gestion des licences et conformité
• 👥 Support utilisateur dédié

Souhaitez-vous plus d'informations sur un service particulier ?`;
    }
    if (lowerMsg.includes('tarif') || lowerMsg.includes('prix') || lowerMsg.includes('coût')) {
        return `Nos tarifs sont personnalisés selon vos besoins spécifiques.

**Critères d'évaluation :**
• Taille de votre parc informatique
• Services souhaités
• Niveau de support requis
• Durée de l'engagement

💬 Contactez-nous pour un devis gratuit et sans engagement !`;
    }
    if (lowerMsg.includes('gpit') || lowerMsg.includes('qui êtes-vous') || lowerMsg.includes('votre entreprise')) {
        return `**GPIT - Services Informatiques Professionnels**

Nous sommes spécialisés dans :
✅ Gestion de parc informatique
✅ Maintenance et support IT
✅ Cybersécurité
✅ Solutions cloud
✅ Conseil et audit

Comment pouvons-nous vous accompagner ?`;
    }
    // Fallback par défaut amélioré
    return `Je suis là pour répondre à vos questions sur :
• Les fonctionnalités de notre site GPIT
• Les services de gestion informatique
• Les informations de contact
• Le support technique

Que souhaitez-vous savoir précisément ? 🤔`;
}
// ✅ TRAITEMENT PRINCIPAL AMÉLIORÉ
async function processUserMessage(userMessage, conversationHistory = []) {
    stats.totalRequests++;
    if (!userMessage || !userMessage.trim()) {
        return {
            response: "Je n'ai pas reçu de message. Posez-moi votre question ! 😊",
            source: 'validation_error'
        };
    }
    // Classifier le message
    const classification = classifyMessage(userMessage);
    console.log(`🎯 Classification: ${classification.type} (${classification.confidence})`);
    // ✅ DÉTECTION PRÉCOCE si pas de token HuggingFace
    if (!HUGGINGFACE_TOKEN && classification.type !== 'greeting') {
        console.log('🔶 Mode dégradé (pas de token HF) - Utilisation des fallbacks intelligents');
        stats.aiFallbacks++;
        return {
            response: generateIntelligentFallback(userMessage, classification.type),
            source: 'degraded_mode',
            responseTime: 50
        };
    }
    // Cache (sauf pour salutations simples)
    const cacheKey = userMessage.toLowerCase().trim().replace(/\s+/g, '_');
    if (classification.type !== 'greeting' && responseCache.has(cacheKey)) {
        const cached = responseCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            stats.cacheHits++;
            console.log('💾 Réponse depuis le cache');
            return { ...cached.data, source: 'cache' };
        }
        responseCache.delete(cacheKey);
    }
    // ✅ RÉPONSE RAPIDE pour salutations simples
    if (classification.type === 'greeting') {
        const quickResp = generateQuickResponse('greeting');
        stats.quickResponses++;
        console.log('⚡ Réponse rapide (salutation)');
        return {
            response: quickResp,
            source: 'quick_response',
            responseTime: 10
        };
    }
    // ✅ IA POUR TOUT LE RESTE
    console.log('🚀 Appel de l\'IA...');
    try {
        const aiResult = await getAIResponse(userMessage, classification.type, conversationHistory);
        if (aiResult && aiResult.response) {
            // Mise en cache
            if (classification.type !== 'greeting') {
                responseCache.set(cacheKey, {
                    data: aiResult,
                    timestamp: Date.now()
                });
            }
            return aiResult;
        }
        // Si tous les modèles échouent
        console.warn('⚠️ Tous les modèles IA ont échoué');
        stats.aiFallbacks++;
        return {
            response: generateIntelligentFallback(userMessage, classification.type),
            source: 'intelligent_fallback',
            responseTime: 100
        };
    }
    catch (error) {
        console.error('❌ Erreur:', error);
        stats.errors++;
        return {
            response: generateIntelligentFallback(userMessage, classification.type),
            source: 'intelligent_fallback',
            responseTime: 100
        };
    }
}
// ✅ MISE À JOUR STATS
function updateAvgResponseTime(responseTime) {
    const prevAvg = stats.avgResponseTime;
    const count = stats.aiSuccesses;
    stats.avgResponseTime = Math.round((prevAvg * (count - 1) + responseTime) / count);
}
// ✅ SAUVEGARDE MESSAGE
async function saveMessage(conversationId, role, content, meta = {}) {
    try {
        const message = new Message({
            conversationId,
            role,
            content,
            meta: {
                timestamp: new Date(),
                ...meta
            }
        });
        await message.save();
        return message;
    }
    catch (err) {
        console.error('❌ Erreur sauvegarde:', err.message);
        return null;
    }
}
// ✅ STREAMING TEXTE
async function streamText(socket, text, delay = 50) {
    if (!text) {
        socket.emit('bot_reply', {
            response: 'Erreur technique. Veuillez réessayer.',
            error: true
        });
        return;
    }
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed) {
            socket.emit('bot_typing', trimmed + ' ');
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    socket.emit('bot_reply', { response: text });
    socket.emit('bot_status', { status: 'ready' });
}
// ✅ SUGGESTIONS CONTEXTUELLES SIMPLIFIÉES
function generateSuggestions(userMessage, aiResponse) {
    const lowerMsg = userMessage.toLowerCase();
    const lowerResp = aiResponse.toLowerCase();
    // ✅ SUPPRIMÉ: "Assistant IA", "Gestion IT", "Tableaux de bord", "Maintenance", "Sécurité", "Tarifs"
    // Suggestions pour CONTACT
    if (lowerResp.includes('contact') || lowerResp.includes('téléphone') || lowerResp.includes('email') ||
        lowerMsg.includes('contact') || lowerMsg.includes('joindre')) {
        return ['📧 Email', '📞 Téléphone', '🏢 Adresse', 'ℹ️ Infos'];
    }
    // Suggestions pour FONCTIONNALITÉS
    if (lowerResp.includes('fonctionnalité') || lowerMsg.includes('site') || lowerMsg.includes('application')) {
        return ['🔧 Services', '📊 Monitoring', '👥 Utilisateurs', '📈 Rapports'];
    }
    if (lowerResp.includes('parc informatique') || lowerMsg.includes('gestion')) {
        return ['💻 Équipements', '🔄 Maintenance', '📋 Inventaire', '🔐 Sécurité'];
    }
    if (lowerMsg.includes('prix') || lowerMsg.includes('tarif')) {
        return ['💰 Devis', '📋 Offres', '❓ Questions', '📞 Contact'];
    }
    if (lowerResp.includes('bonjour') || lowerResp.includes('salut')) {
        return ['🔧 Services', '📞 Contact', '💡 Solutions', 'ℹ️ Infos'];
    }
    // Suggestions générales très simplifiées
    return ['💬 Question', '📞 Contact', '🔧 Services', 'ℹ️ Infos'];
}
// ✅ SOCKET.IO CORRIGÉ (UN SEUL BONJOUR)
function attachSocket(io) {
    io.on('connection', (socket) => {
        console.log('✅ Client connecté:', socket.id);
        // ✅ UN SEUL MESSAGE DE BIENVENUE
        socket.emit('bot_reply', {
            response: "👋 Bonjour ! Je suis l'assistant IA de GPIT. Comment puis-je vous aider aujourd'hui ?",
            source: 'greeting'
        });
        socket.on('send_message', async (data) => {
            const { message, conversationId = `conv_${Date.now()}`, conversationHistory = [] } = data;
            console.log(`\n📨 [${conversationId}] Message:`, message);
            if (!message || !message.trim()) {
                socket.emit('bot_reply', {
                    response: "Votre message semble vide. Posez-moi une question ! 😊",
                    error: true
                });
                return;
            }
            await saveMessage(conversationId, 'user', message);
            socket.emit('bot_status', { status: 'thinking' });
            try {
                const result = await processUserMessage(message, conversationHistory);
                await saveMessage(conversationId, 'assistant', result.response, {
                    source: result.source,
                    model: result.model || 'system',
                    responseTime: result.responseTime || 0
                });
                await streamText(socket, result.response);
                const suggestions = generateSuggestions(message, result.response);
                socket.emit('bot_suggestions', { suggestions });
                socket.emit('stats_update', getStats());
            }
            catch (error) {
                console.error('❌ Erreur:', error);
                socket.emit('bot_reply', {
                    response: "Désolé, une erreur est survenue. Veuillez réessayer.",
                    error: true
                });
                socket.emit('bot_status', { status: 'error' });
            }
        });
        socket.on('disconnect', () => {
            console.log('❌ Client déconnecté:', socket.id);
        });
    });
    // Nettoyage cache
    setInterval(() => {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, value] of responseCache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                responseCache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`🧹 Cache: ${cleaned} entrées supprimées`);
        }
    }, CACHE_DURATION);
    console.log('🚀 Service IA intelligent activé');
    console.log('   ⚡ Salutations → Réponse rapide');
    console.log('   🤖 Questions → IA Prioritaire');
    console.log('   🎯 Fonctionnalités → Réponses spécifiques');
    console.log('   📞 Contact → Informations réelles');
    // ✅ AJOUT: Avertissement si pas de token
    if (!HUGGINGFACE_TOKEN) {
        console.log('⚠️  MODE DÉGRADÉ: Token HuggingFace manquant - Utilisation des fallbacks intelligents');
    }
    else {
        console.log('✅ Token HuggingFace détecté - Mode IA complet activé');
    }
}
// ✅ STATS
function getStats() {
    const total = stats.totalRequests;
    return {
        ...stats,
        cacheSize: responseCache.size,
        cacheHitRate: total > 0 ? `${((stats.cacheHits / total) * 100).toFixed(1)}%` : '0%',
        aiSuccessRate: total > 0 ? `${((stats.aiSuccesses / total) * 100).toFixed(1)}%` : '0%',
        quickResponseRate: total > 0 ? `${((stats.quickResponses / total) * 100).toFixed(1)}%` : '0%',
        fallbackRate: total > 0 ? `${((stats.aiFallbacks / total) * 100).toFixed(1)}%` : '0%'
    };
}
module.exports = {
    attachSocket,
    processUserMessage,
    getStats,
    cleanAIResponse
};
