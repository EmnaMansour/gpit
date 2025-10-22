import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { CHATBOT_CONFIG } from '../config/chatbot.config';

/**
 * Hook personnalisé pour gérer le chatbot GPIT
 * @param {Object} options - Options de configuration
 * @returns {Object} État et fonctions du chatbot
 */
export function useChatbot(options = {}) {
  const {
    socketUrl = CHATBOT_CONFIG.socketUrl,
    onConnect,
    onDisconnect,
    onMessage,
    onError
  } = options;

  const [messages, setMessages] = useState([
    {
      id: '1',
      content: CHATBOT_CONFIG.defaultMessages.welcome,
      isUser: false,
      timestamp: new Date(),
      source: 'greeting',
      suggestions: CHATBOT_CONFIG.defaultSuggestions
    }
  ]);

  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [botStatus, setBotStatus] = useState('idle');
  const [typingText, setTypingText] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const conversationId = useRef(`conv_${Date.now()}`);

  // Connexion Socket.io
  useEffect(() => {
    console.log('🔌 Initialisation Socket.io...', socketUrl);

    socketRef.current = io(socketUrl, CHATBOT_CONFIG.socketOptions);

    // Événements de connexion
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connecté:', socketRef.current.id);
      setIsConnected(true);
      setError(null);
      onConnect?.();
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Socket déconnecté:', reason);
      setIsConnected(false);
      setError('Connexion perdue');
      onDisconnect?.(reason);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('❌ Erreur connexion:', err.message);
      setIsConnected(false);
      setError(`Erreur: ${err.message}`);
      onError?.(err);
    });

    // Événements du chatbot
    socketRef.current.on('bot_status', (data) => {
      console.log('📊 Status:', data.status);
      setBotStatus(data.status);
    });

    socketRef.current.on('bot_typing', (chunk) => {
      setTypingText(prev => prev + chunk);
    });

    socketRef.current.on('bot_reply', (data) => {
      const botMessage = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        source: data.source || 'unknown',
        error: data.error || false
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setTypingText('');
      setBotStatus('idle');
      onMessage?.(botMessage);
    });

    socketRef.current.on('bot_suggestions', (data) => {
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && !lastMessage.isUser) {
          lastMessage.suggestions = data.suggestions;
        }
        return updated;
      });
    });

    socketRef.current.on('stats_update', (data) => {
      setStats(data);
    });

    // Nettoyage
    return () => {
      console.log('🔌 Déconnexion Socket.io...');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [socketUrl, onConnect, onDisconnect, onMessage, onError]);

  // Envoyer un message
  const sendMessage = useCallback((messageText) => {
    if (!messageText?.trim()) {
      console.warn('⚠️ Message vide ignoré');
      return false;
    }

    if (!isConnected) {
      console.error('❌ Socket non connecté');
      setError('Pas de connexion au serveur');
      return false;
    }

    const userMessage = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setTypingText('');
    setError(null);

    // Préparer l'historique
    const conversationHistory = messages.slice(-6).map(msg => ({
      content: msg.content,
      isUser: msg.isUser
    }));

    // Émettre le message
    socketRef.current.emit('send_message', {
      message: messageText,
      conversationId: conversationId.current,
      conversationHistory
    });

    console.log('📤 Message envoyé:', messageText.substring(0, 50));
    return true;
  }, [isConnected, messages]);

  // Envoyer une suggestion
  const sendSuggestion = useCallback((suggestion) => {
    // Nettoyer les emojis
    const cleanText = suggestion.replace(/[🚀💰🎁📞💡🔄📧📱✨🎥📊💬🛡️📜⚡🤖🛟👋]/g, '').trim();
    return sendMessage(cleanText);
  }, [sendMessage]);

  // Effacer l'historique
  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        content: CHATBOT_CONFIG.defaultMessages.welcome,
        isUser: false,
        timestamp: new Date(),
        source: 'greeting',
        suggestions: CHATBOT_CONFIG.defaultSuggestions
      }
    ]);
    conversationId.current = `conv_${Date.now()}`;
    console.log('🗑️ Historique effacé');
  }, []);

  // Demander les statistiques
  const requestStats = useCallback(() => {
    if (isConnected && socketRef.current) {
      socketRef.current.emit('get_stats');
      console.log('📊 Statistiques demandées');
    }
  }, [isConnected]);

  // Réessayer la connexion manuellement
  const reconnect = useCallback(() => {
    if (socketRef.current && !isConnected) {
      console.log('🔄 Tentative de reconnexion...');
      socketRef.current.connect();
    }
  }, [isConnected]);

  return {
    // État
    messages,
    isConnected,
    isTyping,
    botStatus,
    typingText,
    stats,
    error,
    conversationId: conversationId.current,

    // Fonctions
    sendMessage,
    sendSuggestion,
    clearMessages,
    requestStats,
    reconnect
  };
}

export default useChatbot;