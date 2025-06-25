import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import ChatHistory from '../models/ChatHistory.js'; // Nuevo modelo para historial

// @desc    Procesar consulta de chat inteligente
// @route   POST /api/chat/query
// @access  Private
export const processChatQuery = async (req, res) => {
    try {
        const { message, context } = req.body;
        const userId = req.user._id;

        // Validar entrada
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                message: 'El mensaje no puede estar vacío',
                error: 'INVALID_INPUT'
            });
        }

        // Analizar la consulta del usuario
        const queryAnalysis = analyzeUserQuery(message);
        queryAnalysis.message = message; // Agregar el mensaje original

        let response = {};

        switch (queryAnalysis.type) {
            case 'SALES':
                response = await handleSalesQuery(queryAnalysis, userId);
                break;
            case 'PRODUCTS':
                response = await handleProductsQuery(queryAnalysis, userId);
                break;
            case 'CUSTOMERS':
                response = await handleCustomersQuery(queryAnalysis, userId);
                break;
            case 'REPORTS':
                response = await handleReportsQuery(queryAnalysis, userId);
                break;
            case 'ANALYTICS':
                response = await handleAnalyticsQuery(queryAnalysis, userId);
                break;
            case 'HELP':
                response = await handleHelpQuery(queryAnalysis, userId);
                break;
            default:
                response = await handleGeneralQuery(message, userId);
        }

        // Enriquecer respuesta con metadatos
        response.timestamp = new Date();
        response.queryType = queryAnalysis.type;
        response.confidence = queryAnalysis.confidence || 0.8;

        // Guardar la consulta en historial
        await saveChatHistory(userId, message, response, queryAnalysis.type);

        res.json({
            query: message,
            response: response.text,
            data: response.data || null,
            suggestions: response.suggestions || [],
            charts: response.charts || null,
            metadata: {
                type: queryAnalysis.type,
                confidence: response.confidence,
                timestamp: response.timestamp,
                processingTime: Date.now() - req.startTime
            }
        });
    } catch (error) {
        console.error('Error en processChatQuery:', error);
        res.status(500).json({
            message: 'Error procesando consulta',
            error: error.message,
            suggestions: [
                'Intenta reformular tu pregunta',
                'Verifica que los datos estén disponibles',
                'Contacta al soporte si persiste el error'
            ]
        });
    }
};

// Función mejorada para analizar el tipo de consulta
const analyzeUserQuery = (message) => {
    const lowerMessage = message.toLowerCase();

    // Definir patrones más sofisticados
    const patterns = {
        SALES: {
            keywords: ['ventas', 'venta', 'vendido', 'ingresos', 'facturación', 'total vendido', 'facturado', 'ganancias', 'revenue'],
            timeKeywords: ['hoy', 'ayer', 'semana', 'mes', 'año', 'día', 'período'],
            confidence: 0
        },
        PRODUCTS: {
            keywords: ['productos', 'producto', 'inventario', 'stock', 'existencias', 'artículos', 'mercancía'],
            conditions: ['poco stock', 'bajo stock', 'agotado', 'disponible', 'sin stock'],
            confidence: 0
        },
        CUSTOMERS: {
            keywords: ['clientes', 'cliente', 'comprador', 'compradores', 'usuarios'],
            attributes: ['frecuentes', 'nuevos', 'activos', 'inactivos', 'mejores'],
            confidence: 0
        },
        REPORTS: {
            keywords: ['reporte', 'informe', 'análisis', 'estadísticas', 'métricas', 'dashboard'],
            types: ['mensual', 'semanal', 'diario', 'anual', 'comparativo'],
            confidence: 0
        },
        ANALYTICS: {
            keywords: ['tendencias', 'proyección', 'predicción', 'forecast', 'comparar', 'análisis avanzado'],
            confidence: 0
        },
        HELP: {
            keywords: ['ayuda', 'help', 'cómo', 'qué puedes', 'comandos', 'opciones'],
            confidence: 0
        }
    };

    // Calcular confianza para cada tipo
    for (const [type, pattern] of Object.entries(patterns)) {
        pattern.confidence = calculateConfidence(lowerMessage, pattern);
    }

    // Encontrar el tipo con mayor confianza
    const bestMatch = Object.entries(patterns).reduce((best, [type, pattern]) => {
        return pattern.confidence > best.confidence ? { type, confidence: pattern.confidence } : best;
    }, { type: 'GENERAL', confidence: 0 });

    return {
        type: bestMatch.confidence > 0.3 ? bestMatch.type : 'GENERAL',
        confidence: bestMatch.confidence,
        keywords: patterns[bestMatch.type]?.keywords || [],
        detectedTime: detectTimeFrame(lowerMessage),
        detectedFilters: detectFilters(lowerMessage)
    };
};

// Función para calcular confianza
const calculateConfidence = (message, pattern) => {
    let score = 0;
    const totalWords = message.split(' ').length;

    // Puntuación por palabras clave principales
    const mainMatches = pattern.keywords.filter(keyword => message.includes(keyword));
    score += mainMatches.length * 0.4;

    // Puntuación por palabras clave secundarias
    if (pattern.timeKeywords) {
        const timeMatches = pattern.timeKeywords.filter(keyword => message.includes(keyword));
        score += timeMatches.length * 0.2;
    }

    if (pattern.conditions) {
        const conditionMatches = pattern.conditions.filter(condition => message.includes(condition));
        score += conditionMatches.length * 0.3;
    }

    if (pattern.attributes) {
        const attributeMatches = pattern.attributes.filter(attr => message.includes(attr));
        score += attributeMatches.length * 0.2;
    }

    if (pattern.types) {
        const typeMatches = pattern.types.filter(type => message.includes(type));
        score += typeMatches.length * 0.2;
    }

    return Math.min(score, 1.0); // Máximo 1.0
};

// Detectar marco temporal
const detectTimeFrame = (message) => {
    const timePatterns = {
        today: ['hoy', 'día de hoy', 'en el día'],
        yesterday: ['ayer'],
        week: ['semana', 'últimos 7 días', 'esta semana'],
        month: ['mes', 'últimos 30 días', 'este mes'],
        year: ['año', 'este año', 'últimos 12 meses'],
        custom: ['últimos', 'desde', 'hasta', 'entre']
    };

    for (const [period, patterns] of Object.entries(timePatterns)) {
        if (patterns.some(pattern => message.includes(pattern))) {
            return period;
        }
    }
    return 'month'; // Por defecto
};

// Detectar filtros adicionales
const detectFilters = (message) => {
    const filters = {};

    if (message.includes('completada') || message.includes('exitosa')) {
        filters.status = 'completada';
    }
    if (message.includes('cancelada') || message.includes('anulada')) {
        filters.status = 'cancelada';
    }
    if (message.includes('mayor a') || message.includes('más de')) {
        filters.comparison = 'greater';
    }
    if (message.includes('menor a') || message.includes('menos de')) {
        filters.comparison = 'less';
    }

    return filters;
};

// Manejar consultas de ventas mejoradas
const handleSalesQuery = async (analysis, userId) => {
    const message = analysis.message;
    const lowerMessage = message.toLowerCase();

    try {
        // Construir filtro de fecha más sofisticado
        const dateFilter = buildDateFilter(analysis.detectedTime, message);

        // Construir filtros adicionales
        const additionalFilters = {
            estado_venta: analysis.detectedFilters.status || 'completada'
        };

        const sales = await Sale.find({
            ...dateFilter,
            ...additionalFilters
        }).populate('productos.producto', 'nombre_producto precio_venta')
            .populate('cliente', 'nombre_completo email')
            .sort({ fecha_hora: -1 });

        const analytics = calculateSalesAnalytics(sales);

        // Generar respuesta inteligente
        const responseText = generateSalesResponse(analytics, analysis.detectedTime, sales.length);

        // Preparar datos para gráficos
        const chartData = prepareSalesChartData(sales, analysis.detectedTime);

        return {
            text: responseText,
            data: {
                ...analytics,
                sales: sales.slice(0, 10), // Últimas 10 ventas
                period: analysis.detectedTime
            },
            charts: chartData,
            suggestions: generateSalesSuggestions(analytics, analysis.detectedTime)
        };
    } catch (error) {
        console.error('Error en handleSalesQuery:', error);
        return {
            text: 'Lo siento, no pude procesar tu consulta de ventas en este momento.',
            data: null,
            suggestions: ['Intenta preguntar sobre ventas de hoy', 'Consulta ventas de esta semana']
        };
    }
};

// Manejar consultas de productos mejoradas
const handleProductsQuery = async (analysis, userId) => {
    const message = analysis.message;
    const lowerMessage = message.toLowerCase();

    try {
        let products = [];
        let responseText = '';
        let chartData = null;

        if (lowerMessage.includes('poco stock') || lowerMessage.includes('bajo stock')) {
            products = await Product.find({
                $expr: { $lte: ['$stock_actual', '$stock_minimo'] }
            }).sort({ stock_actual: 1 });

            responseText = `📦 **Stock Bajo Detectado**\n\nTienes **${products.length} productos** que necesitan reabastecimiento:\n\n${products.slice(0, 5).map(p => `• **${p.nombre_producto}**: ${p.stock_actual} unidades (mínimo: ${p.stock_minimo})`).join('\n')}`;

            if (products.length > 5) {
                responseText += `\n\n*Y ${products.length - 5} productos más...*`;
            }

        } else if (lowerMessage.includes('más vendidos') || lowerMessage.includes('top productos')) {
            // Obtener productos más vendidos
            const topProducts = await getTopSellingProducts(userId);
            responseText = `🏆 **Productos Más Vendidos**\n\n${topProducts.slice(0, 5).map((p, i) => `${i + 1}. **${p.nombre}**: ${p.totalVendido} unidades`).join('\n')}`;
            chartData = prepareProductChartData(topProducts);

        } else if (lowerMessage.includes('sin stock') || lowerMessage.includes('agotados')) {
            products = await Product.find({ stock_actual: 0 });
            responseText = `❌ **Productos Agotados**\n\nTienes **${products.length} productos** sin stock disponible.`;

        } else {
            // Consulta general de productos
            const totalProducts = await Product.countDocuments();
            const activeProducts = await Product.countDocuments({ stock_actual: { $gt: 0 } });
            const lowStockCount = await Product.countDocuments({
                $expr: { $lte: ['$stock_actual', '$stock_minimo'] }
            });

            responseText = `📊 **Resumen de Inventario**\n\n• **Total productos**: ${totalProducts}\n• **Con stock**: ${activeProducts}\n• **Stock bajo**: ${lowStockCount}\n• **Sin stock**: ${totalProducts - activeProducts}`;
        }

        return {
            text: responseText,
            data: {
                products: products.slice(0, 20),
                summary: await getProductSummary()
            },
            charts: chartData,
            suggestions: [
                'Mostrar productos más vendidos',
                '¿Cuáles productos están agotados?',
                '¿Qué productos debo reordenar?',
                'Análisis de rotación de inventario'
            ]
        };
    } catch (error) {
        console.error('Error en handleProductsQuery:', error);
        return {
            text: 'Lo siento, no pude procesar tu consulta de productos.',
            data: null,
            suggestions: ['Consultar stock bajo', 'Ver productos más vendidos']
        };
    }
};

// Manejar consultas de clientes mejoradas
const handleCustomersQuery = async (analysis, userId) => {
    const message = analysis.message;
    const lowerMessage = message.toLowerCase();

    try {
        let responseText = '';
        let customerData = {};
        let chartData = null;

        if (lowerMessage.includes('mejores') || lowerMessage.includes('frecuentes')) {
            const topCustomers = await getTopCustomers(userId);
            responseText = `👑 **Mejores Clientes**\n\n${topCustomers.slice(0, 5).map((c, i) => `${i + 1}. **${c.nombre}**: $${c.totalCompras.toLocaleString()} (${c.numeroCompras} compras)`).join('\n')}`;
            customerData.topCustomers = topCustomers;
            chartData = prepareCustomerChartData(topCustomers);

        } else if (lowerMessage.includes('nuevos')) {
            const newCustomers = await getNewCustomers(userId, 30); // Últimos 30 días
            responseText = `🆕 **Clientes Nuevos** (últimos 30 días)\n\nHas ganado **${newCustomers.length} nuevos clientes**`;
            customerData.newCustomers = newCustomers;

        } else if (lowerMessage.includes('inactivos')) {
            const inactiveCustomers = await getInactiveCustomers(userId, 90); // Sin compras en 90 días
            responseText = `😴 **Clientes Inactivos**\n\n**${inactiveCustomers.length} clientes** no han comprado en los últimos 90 días`;
            customerData.inactiveCustomers = inactiveCustomers;

        } else {
            // Resumen general de clientes
            const summary = await getCustomerSummary(userId);
            responseText = `👥 **Resumen de Clientes**\n\n• **Total**: ${summary.total}\n• **Activos**: ${summary.active}\n• **Nuevos este mes**: ${summary.newThisMonth}\n• **Ticket promedio**: $${summary.avgTicket.toLocaleString()}`;
            customerData = summary;
        }

        return {
            text: responseText,
            data: customerData,
            charts: chartData,
            suggestions: [
                '¿Quiénes son mis mejores clientes?',
                'Mostrar clientes nuevos',
                '¿Qué clientes están inactivos?',
                'Análisis de comportamiento de compra'
            ]
        };
    } catch (error) {
        console.error('Error en handleCustomersQuery:', error);
        return {
            text: 'Lo siento, no pude procesar tu consulta de clientes.',
            data: null,
            suggestions: ['Ver mejores clientes', 'Consultar clientes nuevos']
        };
    }
};

// Nuevas funciones auxiliares mejoradas
const buildDateFilter = (timeFrame, message) => {
    const today = new Date();
    let startDate, endDate;

    switch (timeFrame) {
        case 'today':
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
            break;
        case 'yesterday':
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'week':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = today;
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = today;
            break;
        case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = today;
            break;
        default:
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = today;
    }

    return {
        fecha_hora: {
            $gte: startDate,
            $lt: endDate
        }
    };
};

const calculateSalesAnalytics = (sales) => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_general, 0);
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calcular productos más vendidos
    const productSales = {};
    sales.forEach(sale => {
        sale.productos.forEach(item => {
            const productId = item.producto._id.toString();
            if (!productSales[productId]) {
                productSales[productId] = {
                    nombre: item.producto.nombre_producto,
                    cantidad: 0,
                    ingresos: 0
                };
            }
            productSales[productId].cantidad += item.cantidad;
            productSales[productId].ingresos += item.cantidad * item.precio_unitario;
        });
    });

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

    return {
        totalSales,
        totalRevenue,
        avgOrderValue,
        topProducts,
        salesGrowth: calculateGrowth(sales),
        peakHours: calculatePeakHours(sales)
    };
};

const generateSalesResponse = (analytics, timeFrame, salesCount) => {
    const { totalRevenue, avgOrderValue } = analytics;
    const timeText = getTimeFrameText(timeFrame);

    let response = `💰 **Resumen de Ventas** ${timeText}\n\n`;
    response += `• **Ventas totales**: ${salesCount}\n`;
    response += `• **Ingresos**: $${totalRevenue.toLocaleString()}\n`;
    response += `• **Ticket promedio**: $${avgOrderValue.toLocaleString()}\n`;

    if (analytics.topProducts.length > 0) {
        response += `\n🏆 **Producto más vendido**: ${analytics.topProducts[0].nombre} (${analytics.topProducts[0].cantidad} unidades)`;
    }

    return response;
};

const getTimeFrameText = (timeFrame) => {
    const texts = {
        today: '(Hoy)',
        yesterday: '(Ayer)',
        week: '(Esta Semana)',
        month: '(Este Mes)',
        year: '(Este Año)'
    };
    return texts[timeFrame] || '(Período Seleccionado)';
};

// Funciones auxiliares adicionales
const getTopSellingProducts = async (userId) => {
    // Implementar agregación para obtener productos más vendidos
    const pipeline = [
        { $match: { estado_venta: 'completada' } },
        { $unwind: '$productos' },
        {
            $group: {
                _id: '$productos.producto',
                totalVendido: { $sum: '$productos.cantidad' },
                ingresos: { $sum: { $multiply: ['$productos.cantidad', '$productos.precio_unitario'] } }
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'producto'
            }
        },
        { $unwind: '$producto' },
        {
            $project: {
                nombre: '$producto.nombre_producto',
                totalVendido: 1,
                ingresos: 1
            }
        },
        { $sort: { totalVendido: -1 } },
        { $limit: 10 }
    ];

    return await Sale.aggregate(pipeline);
};

const getTopCustomers = async (userId) => {
    const pipeline = [
        { $match: { estado_venta: 'completada' } },
        {
            $group: {
                _id: '$cliente',
                totalCompras: { $sum: '$total_general' },
                numeroCompras: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'customers',
                localField: '_id',
                foreignField: '_id',
                as: 'cliente'
            }
        },
        { $unwind: '$cliente' },
        {
            $project: {
                nombre: '$cliente.nombre_completo',
                totalCompras: 1,
                numeroCompras: 1
            }
        },
        { $sort: { totalCompras: -1 } },
        { $limit: 10 }
    ];

    return await Sale.aggregate(pipeline);
};

const handleAnalyticsQuery = async (analysis, userId) => {
    return {
        text: '📊 **Análisis Avanzado**\n\nPuedo generar análisis predictivos y comparativos para optimizar tu negocio.',
        suggestions: [
            'Predicción de ventas próximo mes',
            'Análisis de tendencias de productos',
            'Comparativa año anterior',
            'Análisis de estacionalidad'
        ]
    };
};

const handleHelpQuery = async (analysis, userId) => {
    return {
        text: `🤖 **¿Cómo puedo ayudarte?**

Puedo responder preguntas sobre:

**💰 Ventas**
• "¿Cuánto vendí hoy/semana/mes?"
• "¿Cuál fue mi mejor día de ventas?"
• "Mostrar ventas de ayer"

**📦 Productos**
• "¿Qué productos tienen poco stock?"
• "Productos más vendidos"
• "¿Cuáles están agotados?"

**👥 Clientes**
• "¿Quiénes son mis mejores clientes?"
• "Clientes nuevos este mes"
• "¿Qué clientes están inactivos?"

**📊 Reportes**
• "Reporte mensual de ventas"
• "Análisis de inventario"
• "Métricas del negocio"`,
        suggestions: [
            '¿Cuánto vendí hoy?',
            'Productos con poco stock',
            'Mejores clientes',
            'Reporte de este mes'
        ]
    };
};

const handleReportsQuery = async (analysis, userId) => {
    const message = analysis.message.toLowerCase();

    if (message.includes('mensual') || message.includes('mes')) {
        return await generateMonthlyReport(userId);
    } else if (message.includes('semanal') || message.includes('semana')) {
        return await generateWeeklyReport(userId);
    } else {
        return {
            text: '📋 **Reportes Disponibles**\n\nPuedo generar varios tipos de reportes detallados para tu negocio.',
            suggestions: [
                'Reporte mensual completo',
                'Reporte semanal de ventas',
                'Análisis de productos',
                'Reporte de clientes'
            ]
        };
    }
};

const generateMonthlyReport = async (userId) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const sales = await Sale.find({
        fecha_hora: { $gte: startOfMonth },
        estado_venta: 'completada'
    });

    const analytics = calculateSalesAnalytics(sales);

    return {
        text: `📊 **Reporte Mensual** (${today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })})\n\n${generateSalesResponse(analytics, 'month', sales.length)}`,
        data: analytics,
        charts: prepareSalesChartData(sales, 'month'),
        suggestions: [
            'Comparar con mes anterior',
            'Ver productos más vendidos',
            'Análisis de clientes del mes'
        ]
    };
};

const prepareSalesChartData = (sales, timeFrame) => {
    // Preparar datos para gráficos (ejemplo básico)
    return {
        type: 'line',
        data: {
            labels: sales.map(sale => sale.fecha_hora.toLocaleDateString()),
            datasets: [{
                label: 'Ventas Diarias',
                data: sales.map(sale => sale.total_general)
            }]
        }
    };
};

const generateSalesSuggestions = (analytics, timeFrame) => {
    const suggestions = [
        '¿Cuál fue mi mejor día de ventas?',
        '¿Qué productos se vendieron más?',
        'Comparar con período anterior'
    ];

    if (timeFrame === 'today') {
        suggestions.push('Ver ventas de ayer', 'Resumen de la semana');
    } else if (timeFrame === 'week') {
        suggestions.push('Ver ventas del mes', 'Comparar con semana anterior');
    }

    return suggestions;
};

const saveChatHistory = async (userId, query, response, queryType) => {
    try {
        const chatEntry = new ChatHistory({
            usuario: userId,
            consulta: query,
            respuesta: response.text,
            tipo_consulta: queryType,
            metadata: {
                confidence: response.confidence,
                dataReturned: !!response.data,
                chartsGenerated: !!response.charts
            },
            fecha_consulta: new Date()
        });

        await chatEntry.save();
    } catch (error) {
        console.error('Error guardando historial:', error);
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 50, page = 1 } = req.query;

        const history = await ChatHistory.find({ usuario: userId })
            .sort({ fecha_consulta: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('usuario', 'nombre email');

        res.json({
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: await ChatHistory.countDocuments({ usuario: userId })
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error obteniendo historial',
            error: error.message
        });
    }
};

// Función para limpiar historial antiguo
export const cleanOldHistory = async (req, res) => {
    try {
        const daysToKeep = req.body.days || 90;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await ChatHistory.deleteMany({
            fecha_consulta: { $lt: cutoffDate }
        });

        res.json({
            message: `Eliminadas ${result.deletedCount} entradas del historial`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error limpiando historial',
            error: error.message
        });
    }
};

// Función para obtener estadísticas del chat
export const getChatStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const stats = await ChatHistory.aggregate([
            { $match: { usuario: userId } },
            {
                $group: {
                    _id: '$tipo_consulta',
                    count: { $sum: 1 },
                    avgConfidence: { $avg: '$metadata.confidence' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({ stats });
    } catch (error) {
        res.status(500).json({
            message: 'Error obteniendo estadísticas',
            error: error.message
        });
    }
};

// Agregar estas funciones al final de tu chatController.js

const handleGeneralQuery = async (message, userId) => {
    const lowerMessage = message.toLowerCase();

    // Intentar detectar intención oculta en consultas generales
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('help')) {
        return await handleHelpQuery({ message }, userId);
    }

    if (lowerMessage.includes('qué puedes') || lowerMessage.includes('que puedes')) {
        return {
            text: `🤖 **¡Hola! Soy tu asistente de Apolo POS** 👋

Puedo ayudarte con:

**💰 Consultas de Ventas**
• Ventas del día, semana o mes
• Análisis de ingresos y tendencias
• Comparativas de períodos

**📦 Gestión de Inventario**  
• Stock bajo y productos agotados
• Productos más vendidos
• Análisis de rotación

**👥 Información de Clientes**
• Mejores clientes y más frecuentes
• Nuevos clientes y análisis de comportamiento
• Clientes inactivos

**📊 Reportes y Analytics**
• Reportes automáticos personalizados
• Métricas clave del negocio
• Análisis predictivos

¡Solo pregúntame en lenguaje natural! 😊`,
            suggestions: [
                '¿Cuánto vendí hoy?',
                '¿Qué productos tienen poco stock?',
                '¿Quiénes son mis mejores clientes?',
                'Generar reporte de este mes'
            ]
        };
    }

    // Respuestas para saludos
    if (lowerMessage.includes('hola') || lowerMessage.includes('hi') || lowerMessage.includes('buenos')) {
        const user = await User.findById(userId).select('nombre');
        const userName = user?.nombre || 'Usuario';

        return {
            text: `¡Hola ${userName}! 👋 Soy tu asistente inteligente de **Apolo POS**. 

¿En qué puedo ayudarte hoy?`,
            suggestions: [
                '¿Cuánto vendí hoy?',
                'Productos con poco stock',
                'Ver mis mejores clientes',
                'Ayuda y comandos'
            ]
        };
    }

    // Respuestas para despedidas
    if (lowerMessage.includes('gracias') || lowerMessage.includes('adiós') || lowerMessage.includes('bye')) {
        return {
            text: `¡De nada! 😊 Fue un placer ayudarte. 

Recuerda que estoy aquí 24/7 para cualquier consulta sobre tu negocio. ¡Que tengas un excelente día! 🚀`,
            suggestions: [
                'Consultar ventas',
                'Revisar inventario',
                'Ver clientes',
                'Generar reporte'
            ]
        };
    }

    // Respuesta por defecto mejorada
    return {
        text: `🤔 No estoy seguro de entender tu consulta: "${message}"

Pero puedo ayudarte con información sobre:

• **💰 Ventas**: "¿Cuánto vendí hoy?"
• **📦 Productos**: "¿Qué productos tienen poco stock?"  
• **👥 Clientes**: "¿Quiénes son mis mejores clientes?"
• **📊 Reportes**: "Generar reporte mensual"

¿Podrías ser más específico sobre lo que necesitas? 😊`,
        data: null,
        suggestions: [
            '¿Cuánto vendí hoy?',
            'Productos con poco stock',
            'Mejores clientes',
            'Ayuda con comandos',
            'Ver todas las opciones'
        ]
    };
};

// También agregar estas funciones auxiliares que faltan:

const getProductSummary = async () => {
    try {
        const [totalProducts, activeProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ stock_actual: { $gt: 0 } }),
            Product.countDocuments({ $expr: { $lte: ['$stock_actual', '$stock_minimo'] } }),
            Product.countDocuments({ stock_actual: 0 })
        ]);

        return {
            total: totalProducts,
            active: activeProducts,
            lowStock: lowStockProducts,
            outOfStock: outOfStockProducts,
            stockValue: await calculateTotalStockValue()
        };
    } catch (error) {
        console.error('Error en getProductSummary:', error);
        return {
            total: 0,
            active: 0,
            lowStock: 0,
            outOfStock: 0,
            stockValue: 0
        };
    }
};

const calculateTotalStockValue = async () => {
    try {
        const products = await Product.find({ stock_actual: { $gt: 0 } });
        return products.reduce((total, product) => {
            return total + (product.stock_actual * product.precio_venta);
        }, 0);
    } catch (error) {
        console.error('Error calculando valor de stock:', error);
        return 0;
    }
};

const getCustomerSummary = async (userId) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [totalCustomers, activeCustomers, newCustomersThisMonth] = await Promise.all([
            Customer.countDocuments(),
            Customer.countDocuments({ estado_usuario: 'activo' }),
            Customer.countDocuments({
                fecha_registro: { $gte: startOfMonth }
            })
        ]);

        // Calcular ticket promedio
        const salesData = await Sale.aggregate([
            { $match: { estado_venta: 'completada' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total_general' },
                    totalSales: { $sum: 1 }
                }
            }
        ]);

        const avgTicket = salesData.length > 0 ?
            salesData[0].totalRevenue / salesData[0].totalSales : 0;

        return {
            total: totalCustomers,
            active: activeCustomers,
            newThisMonth: newCustomersThisMonth,
            avgTicket: avgTicket
        };
    } catch (error) {
        console.error('Error en getCustomerSummary:', error);
        return {
            total: 0,
            active: 0,
            newThisMonth: 0,
            avgTicket: 0
        };
    }
};

const getNewCustomers = async (userId, days = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return await Customer.find({
            fecha_registro: { $gte: cutoffDate }
        }).sort({ fecha_registro: -1 }).limit(20);
    } catch (error) {
        console.error('Error en getNewCustomers:', error);
        return [];
    }
};

const getInactiveCustomers = async (userId, days = 90) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        // Obtener clientes que no han hecho compras en X días
        const recentBuyers = await Sale.distinct('cliente', {
            fecha_hora: { $gte: cutoffDate },
            estado_venta: 'completada'
        });

        return await Customer.find({
            _id: { $nin: recentBuyers },
            estado_usuario: 'activo'
        }).limit(50);
    } catch (error) {
        console.error('Error en getInactiveCustomers:', error);
        return [];
    }
};

const calculateGrowth = (sales) => {
    // Función simple para calcular crecimiento
    // Puedes implementar lógica más compleja según tus necesidades
    if (sales.length < 2) return 0;

    const recent = sales.slice(0, Math.floor(sales.length / 2));
    const older = sales.slice(Math.floor(sales.length / 2));

    const recentTotal = recent.reduce((sum, sale) => sum + sale.total_general, 0);
    const olderTotal = older.reduce((sum, sale) => sum + sale.total_general, 0);

    if (olderTotal === 0) return 0;
    return ((recentTotal - olderTotal) / olderTotal) * 100;
};

const calculatePeakHours = (sales) => {
    // Calcular horas pico de ventas
    const hourCounts = {};

    sales.forEach(sale => {
        const hour = new Date(sale.fecha_hora).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const sortedHours = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    return sortedHours.map(([hour, count]) => ({
        hour: parseInt(hour),
        sales: count
    }));
};

const prepareProductChartData = (products) => {
    return {
        type: 'bar',
        data: {
            labels: products.slice(0, 10).map(p => p.nombre),
            datasets: [{
                label: 'Unidades Vendidas',
                data: products.slice(0, 10).map(p => p.totalVendido),
                backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }]
        }
    };
};

const prepareCustomerChartData = (customers) => {
    return {
        type: 'doughnut',
        data: {
            labels: customers.slice(0, 10).map(c => c.nombre),
            datasets: [{
                label: 'Total Compras',
                data: customers.slice(0, 10).map(c => c.totalCompras),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
                ]
            }]
        }
    };
};

const generateWeeklyReport = async (userId) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const sales = await Sale.find({
            fecha_hora: { $gte: startOfWeek },
            estado_venta: 'completada'
        });

        const analytics = calculateSalesAnalytics(sales);

        return {
            text: `📊 **Reporte Semanal** (Últimos 7 días)\n\n${generateSalesResponse(analytics, 'week', sales.length)}`,
            data: analytics,
            charts: prepareSalesChartData(sales, 'week'),
            suggestions: [
                'Comparar con semana anterior',
                'Ver productos más vendidos',
                'Análisis mensual'
            ]
        };
    } catch (error) {
        console.error('Error en generateWeeklyReport:', error);
        return {
            text: 'No pude generar el reporte semanal en este momento.',
            suggestions: ['Intentar de nuevo', 'Ver reporte mensual']
        };
    }
};