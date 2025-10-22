import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, AlertCircle, Wifi, WifiOff, Sparkles, Clock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  source: string;
  suggestions: string[];
  error?: boolean;
}

interface BotStatusData {
  status: 'thinking' | 'quick_response' | 'enriching';
}

interface BotReplyData {
  response: string;
  source?: string;
  error?: boolean;
}

interface BotSuggestionsData {
  suggestions: string[];
}

type BotStatus = 'idle' | 'thinking' | 'quick_response' | 'enriching';
type StatusIndicatorKey = BotStatus | 'offline';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "👋 Bonjour ! Je suis l'assistant IA de GPIT. Comment puis-je vous aider aujourd'hui ?",
      isUser: false,
      timestamp: new Date(),
      source: 'greeting',
      suggestions: ['🚀 Fonctionnalités', '💰 Tarifs', '🎁 Essai gratuit', '📞 Contact']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [botStatus, setBotStatus] = useState<BotStatus>('idle');
  const [typingText, setTypingText] = useState('');
  const [conversationId] = useState(`conv_${Date.now()}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connecté');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket déconnecté');
      setIsConnected(false);
    });

    socketRef.current.on('bot_status', (data: BotStatusData) => {
      setBotStatus(data.status);
      
      const statusMessages: Record<string, string> = {
        thinking: 'L\'IA analyse votre question...',
        quick_response: 'Réponse rapide en cours...',
        enriching: 'Enrichissement par l\'IA...'
      };
      
      if (statusMessages[data.status]) {
        console.log('📊 Status:', statusMessages[data.status]);
      }
    });

    socketRef.current.on('bot_typing', (chunk: string) => {
      setTypingText(prev => prev + chunk);
    });

    socketRef.current.on('bot_reply', (data: BotReplyData) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        source: data.source || 'unknown',
        suggestions: [],
        error: data.error || false
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setTypingText('');
      setBotStatus('idle');
    });

    socketRef.current.on('bot_suggestions', (data: BotSuggestionsData) => {
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && !lastMessage.isUser) {
          lastMessage.suggestions = data.suggestions;
        }
        return updated;
      });
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.error('❌ Erreur connexion:', error);
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Reset bot status when connection is lost
    if (!isConnected) {
      setBotStatus('idle');
    }
  }, [isConnected]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    if (!isConnected) {
      alert('❌ Pas de connexion au serveur. Veuillez réessayer.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      source: 'user',
      suggestions: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setTypingText('');

    const conversationHistory = messages.slice(-6).map(msg => ({
      content: msg.content,
      isUser: msg.isUser
    }));

    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        message: inputValue,
        conversationId,
        conversationHistory
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const cleanedSuggestion = suggestion.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
    setInputValue(cleanedSuggestion);
    setTimeout(handleSendMessage, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIndicator = () => {
    const indicators: Record<StatusIndicatorKey, { text: string; color: string; icon: typeof Wifi }> = {
      idle: { text: 'En ligne', color: 'bg-green-400', icon: Wifi },
      thinking: { text: 'Réflexion...', color: 'bg-blue-400 animate-pulse', icon: Sparkles },
      quick_response: { text: 'Réponse rapide', color: 'bg-yellow-400 animate-pulse', icon: Clock },
      enriching: { text: 'Amélioration IA', color: 'bg-purple-400 animate-pulse', icon: Sparkles },
      offline: { text: 'Hors ligne', color: 'bg-red-400', icon: WifiOff }
    };

    // Determine the current status
    let status: StatusIndicatorKey;
    
    if (!isConnected) {
      status = 'offline';
    } else if (isTyping) {
      // Use the current botStatus if we're typing, fallback to 'thinking' if undefined
      status = botStatus || 'thinking';
    } else {
      status = 'idle';
    }

    // Safely get the indicator, fallback to 'offline' if not found
    const indicator = indicators[status] || indicators.offline;
    const IconComponent = indicator.icon;

    return (
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${indicator.color}`} />
        <IconComponent className="w-3 h-3 text-blue-100" />
        <span className="text-sm">{indicator.text}</span>
      </div>
    );
  };

  const getSourceBadge = (source: string) => {
    const badges: Record<string, { label: string; color: string; emoji: string }> = {
      quick: { label: 'Rapide', color: 'bg-green-600', emoji: '⚡' },
      quick_response: { label: 'Rapide', color: 'bg-green-600', emoji: '⚡' },
      ai: { label: 'IA', color: 'bg-blue-600', emoji: '🤖' },
      hugging_face: { label: 'IA', color: 'bg-blue-600', emoji: '🤖' },
      fallback: { label: 'Support', color: 'bg-orange-600', emoji: '🛟' },
      intelligent_fallback: { label: 'Support', color: 'bg-orange-600', emoji: '🛟' },
      greeting: { label: 'Bienvenue', color: 'bg-purple-600', emoji: '👋' }
    };

    const badge = badges[source] || { label: 'Bot', color: 'bg-gray-600', emoji: '💬' };

    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color} text-white opacity-70`}>
        {badge.emoji} {badge.label}
      </span>
    );
  };

  const getMessageIcon = (message: Message) => {
    if (message.isUser) {
      return <User className="w-5 h-5 text-white" />;
    }
    if (message.error) {
      return <AlertCircle className="w-5 h-5 text-white" />;
    }
    return <Bot className="w-5 h-5 text-white" />;
  };

  const getMessageBackgroundColor = (message: Message) => {
    if (message.isUser) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30';
    }
    if (message.error) {
      return 'bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg';
    }
    return 'bg-gradient-to-br from-gray-700 to-gray-600 shadow-lg';
  };

  const getMessageBubbleClass = (message: Message) => {
    if (message.isUser) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none';
    }
    if (message.error) {
      return 'bg-orange-900/40 text-orange-100 rounded-bl-none backdrop-blur-sm border border-orange-700/50';
    }
    return 'bg-gray-800/90 text-gray-100 rounded-bl-none backdrop-blur-sm border border-gray-700/50';
  };

  const getMessageTimeClass = (message: Message) => {
    return message.isUser ? 'text-blue-100/70' : 'text-gray-500';
  };

  const getTypingIndicatorMessage = () => {
    if (botStatus === 'thinking') return 'L\'IA analyse...';
    if (botStatus === 'quick_response') return 'Réponse instantanée...';
    if (botStatus === 'enriching') return 'Enrichissement IA...';
    return 'En cours...';
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-8 h-8 text-white mx-auto" />
            {!isConnected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-8 right-8 z-50 w-[420px] h-[700px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 p-5 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 relative">
                  <Bot className="w-7 h-7 text-white" />
                  {isTyping && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-bounce" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Assistant IA GPIT</h3>
                  <div className="text-blue-100 text-xs">
                    {getStatusIndicator()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-900/50">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getMessageBackgroundColor(message)}`}>
                      {getMessageIcon(message)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className={`rounded-2xl p-4 shadow-lg ${getMessageBubbleClass(message)}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <span className={`text-xs ${getMessageTimeClass(message)}`}>
                            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!message.isUser && message.source && getSourceBadge(message.source)}
                        </div>
                      </div>

                      {message.suggestions && message.suggestions.length > 0 && index === messages.length - 1 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <motion.button
                              key={`suggestion_${message.id}_${idx}`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs bg-gray-700/70 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg px-3 py-2 transition-all duration-200 border border-gray-600/30 hover:border-blue-500/50"
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && typingText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-800/90 rounded-2xl rounded-bl-none p-4 backdrop-blur-sm border border-gray-700/50 max-w-[85%]">
                    <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-line">{typingText}</p>
                  </div>
                </motion.div>
              )}

              {isTyping && !typingText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-800/90 rounded-2xl rounded-bl-none p-4 backdrop-blur-sm border border-gray-700/50">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {getTypingIndicatorMessage()}
                    </p>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
              {!isConnected && (
                <div className="mb-3 p-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200 text-xs flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  <span>Connexion perdue. Reconnexion...</span>
                </div>
              )}
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Posez votre question à l'IA..."
                    disabled={!isConnected}
                    className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || !isConnected}
                  whileHover={{ scale: isConnected && inputValue.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: isConnected && inputValue.trim() ? 0.95 : 1 }}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-500 text-white rounded-xl px-4 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center min-w-[50px]"
                >
                  {isTyping ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}