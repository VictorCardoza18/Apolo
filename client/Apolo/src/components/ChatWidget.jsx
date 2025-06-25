import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: '¡Hola! Soy tu asistente inteligente de **Apolo POS**. 🚀\n\nPuedo ayudarte con consultas sobre:\n• 📊 **Ventas y facturación**\n• 📦 **Productos e inventario**\n• 👥 **Gestión de clientes**\n• 📈 **Reportes y analytics**\n\n¿En qué puedo ayudarte hoy?',
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

    // Función para formatear números como moneda
    const formatCurrency = (amount) => {
        if (amount == null || isNaN(amount)) return '$0';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD', // Cambia por tu moneda
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Función para formatear fechas de manera amigable
    const formatDateFriendly = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';

        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Función para formatear datos de ventas del backend
    const formatSalesData = (data) => {
        if (!data) return '';

        let html = '<div class="space-y-3">';

        // Métricas principales
        if (data.totalSales !== undefined || data.totalRevenue !== undefined) {
            html += '<div class="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">';
            html += '<div class="flex items-center mb-3">';
            html += '<span class="text-2xl mr-2">💰</span>';
            html += '<h4 class="text-lg font-semibold text-green-400">Resumen de Ventas</h4>';
            html += '</div>';
            html += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">';

            if (data.totalRevenue !== undefined) {
                html += `<div class="text-center bg-black/20 rounded-lg p-3">
                    <div class="text-2xl font-bold text-white">${formatCurrency(data.totalRevenue)}</div>
                    <div class="text-sm text-green-300">Ingresos Totales</div>
                </div>`;
            }

            if (data.totalSales !== undefined) {
                html += `<div class="text-center bg-black/20 rounded-lg p-3">
                    <div class="text-2xl font-bold text-white">${data.totalSales}</div>
                    <div class="text-sm text-green-300">Transacciones</div>
                </div>`;
            }

            if (data.avgOrderValue !== undefined) {
                html += `<div class="text-center bg-black/20 rounded-lg p-3">
                    <div class="text-2xl font-bold text-white">${formatCurrency(data.avgOrderValue)}</div>
                    <div class="text-sm text-green-300">Ticket Promedio</div>
                </div>`;
            }

            html += '</div></div>';
        }

        // Productos más vendidos
        if (data.topProducts && data.topProducts.length > 0) {
            html += '<div class="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg p-4 border border-blue-500/30">';
            html += '<div class="flex items-center mb-3">';
            html += '<span class="text-xl mr-2">🏆</span>';
            html += '<h4 class="font-semibold text-blue-400">Productos Más Vendidos</h4>';
            html += '</div>';

            data.topProducts.slice(0, 5).forEach((product, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                html += `<div class="flex justify-between items-center py-2 border-b border-blue-500/20 last:border-b-0">
                    <div class="flex items-center">
                        <span class="mr-2">${medal}</span>
                        <span class="text-white font-medium">${product.nombre || product.name || 'Producto'}</span>
                    </div>
                    <div class="text-right">
                        <div class="text-blue-300 font-semibold">${product.cantidad || product.totalVendido || 0} unidades</div>
                        ${product.ingresos ? `<div class="text-xs text-blue-400">${formatCurrency(product.ingresos)}</div>` : ''}
                    </div>
                </div>`;
            });

            html += '</div>';
        }

        // Ventas recientes
        if (data.sales && data.sales.length > 0) {
            html += '<div class="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600/30">';
            html += '<div class="flex items-center mb-3">';
            html += '<span class="text-xl mr-2">📋</span>';
            html += '<h4 class="font-semibold text-zinc-300">Ventas Recientes</h4>';
            html += '</div>';

            data.sales.slice(0, 5).forEach(sale => {
                const date = new Date(sale.fecha_hora || sale.createdAt);
                const clienteName = sale.cliente?.nombre_completo || sale.cliente?.nombre || 'Cliente';

                html += `<div class="flex justify-between items-center py-2 border-b border-zinc-600/20 last:border-b-0">
                    <div>
                        <div class="text-white font-medium">${clienteName}</div>
                        <div class="text-xs text-zinc-400">${formatDateFriendly(date)}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-green-400 font-semibold">${formatCurrency(sale.total_general || sale.total)}</div>
                        <div class="text-xs text-zinc-400">${sale.productos?.length || 0} items</div>
                    </div>
                </div>`;
            });

            html += '</div>';
        }

        html += '</div>';
        return html;
    };

    // Función para formatear datos de productos del backend
    const formatProductsData = (data) => {
        if (!data) return '';

        let html = '<div class="space-y-3">';

        // Resumen de productos
        if (data.summary) {
            const { total, active, lowStock, outOfStock, stockValue } = data.summary;

            html += '<div class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30">';
            html += '<div class="flex items-center mb-3">';
            html += '<span class="text-2xl mr-2">📦</span>';
            html += '<h4 class="text-lg font-semibold text-purple-400">Resumen de Inventario</h4>';
            html += '</div>';
            html += '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">';

            html += `<div class="text-center bg-black/20 rounded-lg p-3">
                <div class="text-xl font-bold text-white">${total || 0}</div>
                <div class="text-xs text-purple-300">Total</div>
            </div>`;

            html += `<div class="text-center bg-black/20 rounded-lg p-3">
                <div class="text-xl font-bold text-green-400">${active || 0}</div>
                <div class="text-xs text-purple-300">Con Stock</div>
            </div>`;

            html += `<div class="text-center bg-black/20 rounded-lg p-3">
                <div class="text-xl font-bold text-yellow-400">${lowStock || 0}</div>
                <div class="text-xs text-purple-300">Stock Bajo</div>
            </div>`;

            html += `<div class="text-center bg-black/20 rounded-lg p-3">
                <div class="text-xl font-bold text-red-400">${outOfStock || 0}</div>
                <div class="text-xs text-purple-300">Agotados</div>
            </div>`;

            html += '</div>';

            if (stockValue) {
                html += `<div class="mt-3 text-center">
                    <div class="text-sm text-purple-300">Valor Total del Inventario</div>
                    <div class="text-2xl font-bold text-white">${formatCurrency(stockValue)}</div>
                </div>`;
            }

            html += '</div>';
        }

        // Lista de productos
        if (data.products && data.products.length > 0) {
            html += '<div class="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600/30">';
            html += '<div class="flex items-center mb-3">';
            html += '<span class="text-xl mr-2">📋</span>';
            html += '<h4 class="font-semibold text-zinc-300">Productos</h4>';
            html += '</div>';

            data.products.slice(0, 10).forEach(product => {
                const stock = product.stock_actual || product.stock || 0;
                const minStock = product.stock_minimo || product.minStock || 0;
                const isLowStock = stock <= minStock;
                const stockColor = stock === 0 ? 'text-red-400' : isLowStock ? 'text-yellow-400' : 'text-green-400';
                const stockIcon = stock === 0 ? '❌' : isLowStock ? '⚠️' : '✅';

                html += `<div class="flex justify-between items-center py-3 border-b border-zinc-600/20 last:border-b-0">
                    <div class="flex-1">
                        <div class="text-white font-medium">${product.nombre_producto || product.nombre || product.name || 'Producto'}</div>
                        <div class="text-xs text-zinc-400">${product.categoria || product.category || 'Sin categoría'}</div>
                        ${product.codigo_producto ? `<div class="text-xs text-zinc-500">Código: ${product.codigo_producto}</div>` : ''}
                    </div>
                    <div class="text-right ml-4">
                        <div class="flex items-center ${stockColor}">
                            <span class="mr-1">${stockIcon}</span>
                            <span class="font-semibold">${stock}</span>
                        </div>
                        <div class="text-xs text-zinc-400">Min: ${minStock}</div>
                        ${product.precio_venta ? `<div class="text-xs text-green-400">${formatCurrency(product.precio_venta)}</div>` : ''}
                    </div>
                </div>`;
            });

            html += '</div>';
        }

        html += '</div>';
        return html;
    };

    // Función para formatear datos de clientes del backend
    const formatCustomersData = (data) => {
        if (!data) return '';

        let html = '<div class="space-y-3">';

        // Resumen de clientes
        if (data.total !== undefined || data.active !== undefined) {
            html += '<div class="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-500/30">';
            html += '<div class="flex items-center mb-3">';
            html += '<span class="text-2xl mr-2">👥</span>';
            html += '<h4 class="text-lg font-semibold text-cyan-400">Resumen de Clientes</h4>';
            html += '</div>';
            html += '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">';

            if (data.total !== undefined) {
                html += `<div class="text-center bg-black/20 rounded-lg p-3">
                    <div class="text-xl font-bold text-white">${data.total}</div>
                    <div class="text-xs text-cyan-300">Total</div>
                </div>`;
            }

            if (data.active !== undefined) {
                html += `<div class="text-center bg-black/20 rounded-lg p-3">
                    <div class="text-xl font-bold text-green-400">${data.active}</div>
                    <div class="text-xs text-cyan-300">Activos</div>
                </div>`;
            }

            if (data.newThisMonth !== undefined) {
                html += `<div class="text-center bg-black/20 rounded-lg p-3">
                    <div class="text-xl font-bold text-purple-400">${data.newThisMonth}</div>
                    <div class="text-xs text-cyan-300">Nuevos</div>
                </div>`;
            }

            if (data.avgTicket !== undefined) {
                html += `<div class="text-center bg-black/20 rounded-lg p-3">
                    <div class="text-xl font-bold text-yellow-400">${formatCurrency(data.avgTicket)}</div>
                    <div class="text-xs text-cyan-300">Ticket Promedio</div>
                </div>`;
            }

            html += '</div></div>';
        }

        // Top clientes
        if (data.topCustomers && data.topCustomers.length > 0) {
            html += '<div class="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600/30">';
            html += '<div class="flex items-center mb-3">';
            html += '<span class="text-xl mr-2">👑</span>';
            html += '<h4 class="font-semibold text-zinc-300">Mejores Clientes</h4>';
            html += '</div>';

            data.topCustomers.slice(0, 5).forEach((customer, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

                html += `<div class="flex justify-between items-center py-3 border-b border-zinc-600/20 last:border-b-0">
                    <div class="flex items-center">
                        <span class="mr-2">${medal}</span>
                        <div>
                            <div class="text-white font-medium">${customer.nombre || customer.name || 'Cliente'}</div>
                            <div class="text-xs text-zinc-400">${customer.numeroCompras || customer.totalPurchases || 0} compras</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-green-400 font-semibold">${formatCurrency(customer.totalCompras || customer.totalSpent || 0)}</div>
                    </div>
                </div>`;
            });

            html += '</div>';
        }

        // Clientes nuevos
        if (data.newCustomers && data.newCustomers.length > 0) {
            html += '<div class="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600/30">';
            html += '<div class="flex items-center mb-3">';
            html += '<span class="text-xl mr-2">🆕</span>';
            html += '<h4 class="font-semibold text-zinc-300">Clientes Nuevos</h4>';
            html += '</div>';

            data.newCustomers.slice(0, 5).forEach(customer => {
                const regDate = new Date(customer.fecha_registro || customer.createdAt);

                html += `<div class="flex justify-between items-center py-2 border-b border-zinc-600/20 last:border-b-0">
                    <div>
                        <div class="text-white font-medium">${customer.nombre_completo || customer.nombre || customer.name || 'Cliente'}</div>
                        ${customer.email ? `<div class="text-xs text-zinc-400">${customer.email}</div>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-purple-400">${formatDateFriendly(regDate)}</div>
                    </div>
                </div>`;
            });

            html += '</div>';
        }

        // Clientes inactivos
        if (data.inactiveCustomers && data.inactiveCustomers.length > 0) {
            html += '<div class="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600/30">';
            html += '<div class="flex items-center mb-3">';
            html += '<span class="text-xl mr-2">😴</span>';
            html += '<h4 class="font-semibold text-zinc-300">Clientes Inactivos</h4>';
            html += '</div>';

            data.inactiveCustomers.slice(0, 5).forEach(customer => {
                html += `<div class="flex justify-between items-center py-2 border-b border-zinc-600/20 last:border-b-0">
                    <div>
                        <div class="text-white font-medium">${customer.nombre_completo || customer.nombre || customer.name || 'Cliente'}</div>
                        ${customer.email ? `<div class="text-xs text-zinc-400">${customer.email}</div>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-orange-400">Inactivo</div>
                    </div>
                </div>`;
            });

            html += '</div>';
        }

        html += '</div>';
        return html;
    };

    // Función principal para formatear datos según el tipo
    const formatBackendData = (data, queryType, metadata) => {
        if (!data) return '';

        // Usar el tipo de consulta para formatear apropiadamente
        switch (queryType || metadata?.type) {
            case 'SALES':
                return formatSalesData(data);
            case 'PRODUCTS':
                return formatProductsData(data);
            case 'CUSTOMERS':
                return formatCustomersData(data);
            case 'REPORTS':
            case 'ANALYTICS':
                // Para reportes, intentar detectar el tipo de datos
                if (data.totalRevenue !== undefined || data.totalSales !== undefined) {
                    return formatSalesData(data);
                } else if (data.products || data.summary) {
                    return formatProductsData(data);
                } else if (data.topCustomers || data.total !== undefined) {
                    return formatCustomersData(data);
                }
                break;
            default:
                // Intentar detectar automáticamente
                if (data.totalRevenue !== undefined || data.totalSales !== undefined || data.sales) {
                    return formatSalesData(data);
                } else if (data.products || data.summary) {
                    return formatProductsData(data);
                } else if (data.topCustomers || data.newCustomers || data.total !== undefined) {
                    return formatCustomersData(data);
                }
        }

        // Fallback para datos no reconocidos
        return `<div class="bg-zinc-700/30 rounded-lg p-3 border border-zinc-600/30">
            <div class="text-sm text-zinc-300 mb-2">📊 Datos del sistema:</div>
            <pre class="text-xs text-zinc-400 whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto">${JSON.stringify(data, null, 2)}</pre>
        </div>`;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            const startTime = Date.now();
            const response = await api.post('/chat/query', {
                message: messageText,
                context: {
                    userId: user._id,
                    timestamp: new Date()
                }
            });

            const processingTime = Date.now() - startTime;

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response.data.response,
                data: response.data.data,
                charts: response.data.charts,
                suggestions: response.data.suggestions,
                metadata: response.data.metadata,
                processingTime,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setSuggestions(response.data.suggestions || []);

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: `❌ **Error procesando consulta**\n\n${error.response?.data?.message || 'Lo siento, hubo un error procesando tu consulta. Por favor intenta de nuevo en unos momentos.'}\n\n*Si el problema persiste, contacta al soporte técnico.*`,
                timestamp: new Date(),
                isError: true,
                suggestions: error.response?.data?.suggestions || [
                    'Intenta reformular tu pregunta',
                    'Verifica tu conexión',
                    'Contactar soporte'
                ]
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
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            .replace(/•/g, '<span class="text-blue-400">•</span>')
            .replace(/\n/g, '<br/>');
    };

    // Botón flotante cuando está cerrado
    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-3xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
                    <div className="relative z-10">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold border-2 border-white/20">
                        AI
                    </div>
                </button>
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
        <div className="fixed inset-4 sm:bottom-4 sm:right-4 sm:top-auto sm:left-auto z-50 
                       sm:w-96 sm:max-w-[calc(100vw-2rem)] 
                       sm:h-[600px] sm:max-h-[calc(100vh-2rem)]
                       w-full h-full
                       bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-none sm:rounded-xl 
                       shadow-2xl border-0 sm:border border-zinc-700/50 
                       flex flex-col overflow-hidden backdrop-blur-md">

            {/* Header mejorado */}
            <div className="bg-gradient-to-r from-zinc-800 via-zinc-800 to-zinc-900 border-b border-zinc-700/50 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-blue-500/30">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 01-1.414 1.414L2.586 12a2 2 0 010-2.828l2.293-2.293a1 1 0 011.414 0zM17.414 7.707a1 1 0 00-1.414-1.414L13.707 8.586a2 2 0 000 2.828L16 13.707a1 1 0 001.414-1.414L15.121 10l2.293-2.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border-2 border-zinc-800 animate-pulse"></div>
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
                        <button
                            onClick={() => setMessages([messages[0]])}
                            className="text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors"
                            title="Limpiar conversación"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>

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
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800">
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
                                } px-3 sm:px-4 py-2 sm:py-3 shadow-lg`}
                        >
                            {/* Contenido del mensaje */}
                            <div
                                className="text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: formatMessage(message.content)
                                }}
                            />

                            {/* Datos estructurados MEJORADOS */}
                            {message.data && (
                                <div className="mt-4">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: formatBackendData(message.data, message.metadata?.type, message.metadata)
                                        }}
                                    />
                                </div>
                            )}

                            {/* Información de metadata si está disponible */}
                            {message.metadata && (
                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                    {message.metadata.type && (
                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                                            {message.metadata.type}
                                        </span>
                                    )}
                                    {message.metadata.confidence && (
                                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                                            {Math.round(message.metadata.confidence * 100)}% confianza
                                        </span>
                                    )}
                                    {message.processingTime && (
                                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                                            {message.processingTime}ms
                                        </span>
                                    )}
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
                        <div className="bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-md shadow-lg">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-zinc-400">Apolo está analizando...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Acciones rápidas */}
            {!isTyping && messages.length === 1 && (
                <div className="px-3 sm:px-4 py-3 border-t border-zinc-700/50 bg-zinc-800/30">
                    <div className="text-xs text-zinc-400 mb-2 font-medium">🚀 Acciones rápidas:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(action.action)}
                                className="flex items-center space-x-2 bg-zinc-700/30 hover:bg-zinc-600/50 p-2 rounded-lg transition-colors text-left border border-zinc-600/30 hover:border-zinc-500/50"
                            >
                                <span className="text-base sm:text-lg">{action.emoji}</span>
                                <span className="text-xs text-zinc-300 truncate">{action.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sugerencias dinámicas */}
            {suggestions.length > 0 && messages.length > 1 && (
                <div className="px-3 sm:px-4 py-2 border-t border-zinc-700/50 bg-zinc-800/30">
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
                                className="text-xs bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-300 px-2 py-1 rounded-md transition-colors border border-blue-500/30"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input mejorado */}
            <div className="p-3 sm:p-4 border-t border-zinc-700/50 bg-zinc-800/50">
                <div className="flex items-end space-x-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowEmojis(!showEmojis)}
                            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-700/50 transition-colors"
                            title="Emojis"
                        >
                            <span className="text-base sm:text-lg">😊</span>
                        </button>

                        {showEmojis && (
                            <div className="absolute bottom-full left-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg p-2 shadow-xl grid grid-cols-4 sm:grid-cols-6 gap-1 max-w-48">
                                {emojis.map((emoji, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="hover:bg-zinc-700 p-1 rounded transition-colors text-center"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

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
                            className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-colors"
                            rows="1"
                            style={{ minHeight: '40px', maxHeight: '100px' }}
                            disabled={isTyping}
                        />

                        <div className="absolute bottom-1 right-2 text-xs text-zinc-500">
                            {inputMessage.length}/500
                        </div>
                    </div>

                    <button
                        onClick={() => sendMessage()}
                        disabled={isTyping || !inputMessage.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-zinc-600 disabled:to-zinc-700 disabled:cursor-not-allowed text-white p-2 sm:p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
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

                <div className="mt-2 text-xs text-zinc-500 flex items-center hidden sm:flex">
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