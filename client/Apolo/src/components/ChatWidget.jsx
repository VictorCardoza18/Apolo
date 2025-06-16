import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: '¡Hola! Soy tu asistente inteligente de **Apolo POS**. 🚀\n\nPuedo ayudarte con consultas sobre:\n• 📊 **Ventas y facturación**\n• 📦 **Productos e inventario**\n• 👥 **Clientes y estadísticas**\n• 📈 **Reportes y análisis**\n\n¿En qué puedo ayudarte hoy?',
            timestamp: new Date(),
            suggestions: [
                '¿Cuánto vendí hoy?',
                '¿Qué productos tienen poco stock?',
                '¿Cuántos clientes tengo activos?',
                'Muéstrame mis mejores productos'
            ]
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([
        '¿Cuánto vendí hoy?',
        '¿Qué productos tienen poco stock?',
        '¿Cuántos clientes tengo activos?'
    ]);
    const [showEmojis, setShowEmojis] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { user } = useAuth();

    const quickActions = [
        { emoji: '💰', text: 'Ventas de hoy', action: '¿Cuánto vendí hoy?' },
        { emoji: '📦', text: 'Stock bajo', action: '¿Qué productos tienen poco stock?' },
        { emoji: '👥', text: 'Clientes', action: '¿Cuántos clientes tengo?' },
        { emoji: '📊', text: 'Reporte mensual', action: 'Genera un reporte de este mes' }
    ];

    const emojis = ['😊', '👍', '💰', '📊', '🚀', '✨', '💡', '🎯', '📈', '🔥', '⭐', '💪'];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-focus en input cuando se abre el chat
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        setShowEmojis(false);

        try {
            const response = await api.post('/chat/query', {
                message: messageText,
                context: {
                    userId: user._id,
                    timestamp: new Date()
                }
            });

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response.data.response,
                data: response.data.data,
                suggestions: response.data.suggestions,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setSuggestions(response.data.suggestions || []);

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: '❌ Lo siento, hubo un error procesando tu consulta. Por favor intenta de nuevo en unos momentos.',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
    };

    const handleEmojiClick = (emoji) => {
        setInputMessage(prev => prev + emoji);
        setShowEmojis(false);
        inputRef.current?.focus();
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMessage = (content) => {
        // Procesar markdown básico
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            .replace(/•/g, '<span class="text-blue-400">•</span>')
            .replace(/\n/g, '<br/>');
    };

    // Botón flotante cuando está cerrado
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/25"
                >
                    {/* Efecto de pulso */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>

                    {/* Ícono principal */}
                    <div className="relative z-10">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {/* Badge de notificación */}
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-zinc-900">
                        AI
                    </div>
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                    <div className="bg-zinc-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-zinc-700 whitespace-nowrap">
                        Asistente Inteligente Apolo
                        <div className="absolute top-full right-4 border-4 border-transparent border-t-zinc-800"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-xl shadow-2xl border border-zinc-700/50 flex flex-col overflow-hidden backdrop-blur-sm">
            {/* Header mejorado */}
            <div className="bg-gradient-to-r from-zinc-800 via-zinc-800 to-zinc-900 border-b border-zinc-700/50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* Avatar del bot con animación */}
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-blue-500/30">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            {/* Indicador de estado activo */}
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-800 animate-pulse"></div>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold text-sm flex items-center">
                                Asistente Apolo
                                <span className="ml-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">
                                    IA
                                </span>
                            </h3>
                            <p className="text-xs text-emerald-400 flex items-center">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                                En línea
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Botón de limpiar chat */}
                        <button
                            onClick={() => setMessages([messages[0]])}
                            className="text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors"
                            title="Limpiar conversación"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>

                        {/* Botón de cerrar */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Área de mensajes con scroll mejorado */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                        <div
                            className={`max-w-[85%] ${message.type === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md'
                                    : message.isError
                                        ? 'bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 text-red-200 rounded-2xl rounded-bl-md'
                                        : 'bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 text-zinc-100 rounded-2xl rounded-bl-md'
                                } px-4 py-3 shadow-lg`}
                        >
                            {/* Contenido del mensaje */}
                            <div
                                className="text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: formatMessage(message.content)
                                }}
                            />

                            {/* Datos estructurados si los hay */}
                            {message.data && (
                                <div className="mt-3 bg-black/20 rounded-lg p-3 border border-zinc-600/30">
                                    <div className="text-xs text-zinc-300 mb-2 font-medium">📊 Datos detallados:</div>
                                    <pre className="text-xs text-zinc-400 whitespace-pre-wrap overflow-x-auto">
                                        {JSON.stringify(message.data, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Sugerencias integradas */}
                            {message.suggestions && message.suggestions.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <div className="text-xs text-zinc-400 font-medium">💡 Preguntas relacionadas:</div>
                                    <div className="space-y-1">
                                        {message.suggestions.slice(0, 3).map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="block w-full text-left text-xs bg-zinc-700/50 hover:bg-zinc-600/50 px-3 py-2 rounded-lg transition-colors border border-zinc-600/30 hover:border-zinc-500/50"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Timestamp */}
                            <div className={`text-xs mt-2 opacity-70 ${message.type === 'user' ? 'text-blue-100' : 'text-zinc-500'
                                }`}>
                                {formatTimestamp(message.timestamp)}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Indicador de escritura */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-zinc-400">Apolo está pensando...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Acciones rápidas */}
            {!isTyping && messages.length === 1 && (
                <div className="px-4 py-3 border-t border-zinc-700/50 bg-zinc-800/30">
                    <div className="text-xs text-zinc-400 mb-2 font-medium">🚀 Acciones rápidas:</div>
                    <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(action.action)}
                                className="flex items-center space-x-2 bg-zinc-700/30 hover:bg-zinc-600/50 p-2 rounded-lg transition-colors text-left border border-zinc-600/30 hover:border-zinc-500/50"
                            >
                                <span className="text-lg">{action.emoji}</span>
                                <span className="text-xs text-zinc-300">{action.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sugerencias dinámicas */}
            {suggestions.length > 0 && messages.length > 1 && (
                <div className="px-4 py-2 border-t border-zinc-700/50 bg-zinc-800/30">
                    <div className="text-xs text-zinc-400 mb-2 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                        </svg>
                        Sugerencias
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {suggestions.slice(0, 2).map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-300 px-2 py-1 rounded-md transition-colors border border-blue-500/30 hover:border-blue-400/50"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input mejorado */}
            <div className="p-4 border-t border-zinc-700/50 bg-zinc-800/50">
                <div className="flex items-end space-x-2">
                    {/* Panel de emojis */}
                    <div className="relative">
                        <button
                            onClick={() => setShowEmojis(!showEmojis)}
                            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-700/50 transition-colors"
                            title="Emojis"
                        >
                            <span className="text-lg">😊</span>
                        </button>

                        {/* Dropdown de emojis */}
                        {showEmojis && (
                            <div className="absolute bottom-full left-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg p-2 shadow-xl grid grid-cols-6 gap-1">
                                {emojis.map((emoji, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="hover:bg-zinc-700 p-1 rounded transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input principal */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Pregúntame sobre ventas, productos, clientes..."
                            className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-700 transition-all"
                            rows="1"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                            disabled={isTyping}
                        />

                        {/* Indicador de caracteres */}
                        <div className="absolute bottom-1 right-2 text-xs text-zinc-500">
                            {inputMessage.length}/500
                        </div>
                    </div>

                    {/* Botón de enviar */}
                    <button
                        onClick={() => sendMessage()}
                        disabled={isTyping || !inputMessage.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-zinc-600 disabled:to-zinc-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 disabled:transform-none"
                    >
                        {isTyping ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Tips */}
                <div className="mt-2 text-xs text-zinc-500 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Presiona Enter para enviar, Shift+Enter para nueva línea
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;