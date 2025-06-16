import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';

// @desc    Procesar consulta de chat inteligente
// @route   POST /api/chat/query
// @access  Private
export const processChatQuery = async (req, res) => {
    try {
        const { message, context } = req.body;
        const userId = req.user._id;

        // Analizar la consulta del usuario
        const queryAnalysis = analyzeUserQuery(message);

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
            default:
                response = await handleGeneralQuery(message, userId);
        }

        // Guardar la consulta en historial (opcional)
        await saveChatHistory(userId, message, response);

        res.json({
            query: message,
            response: response.text,
            data: response.data || null,
            suggestions: response.suggestions || [],
            charts: response.charts || null
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error procesando consulta',
            error: error.message
        });
    }
};

// Función para analizar el tipo de consulta
const analyzeUserQuery = (message) => {
    const lowerMessage = message.toLowerCase();

    // Palabras clave para ventas
    const salesKeywords = ['ventas', 'venta', 'vendido', 'ingresos', 'facturación', 'total vendido'];

    // Palabras clave para productos
    const productKeywords = ['productos', 'producto', 'inventario', 'stock', 'existencias'];

    // Palabras clave para clientes
    const customerKeywords = ['clientes', 'cliente', 'comprador'];

    // Palabras clave para reportes
    const reportKeywords = ['reporte', 'informe', 'análisis', 'estadísticas', 'métricas'];

    if (salesKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return { type: 'SALES', keywords: salesKeywords.filter(k => lowerMessage.includes(k)) };
    }

    if (productKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return { type: 'PRODUCTS', keywords: productKeywords.filter(k => lowerMessage.includes(k)) };
    }

    if (customerKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return { type: 'CUSTOMERS', keywords: customerKeywords.filter(k => lowerMessage.includes(k)) };
    }

    if (reportKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return { type: 'REPORTS', keywords: reportKeywords.filter(k => lowerMessage.includes(k)) };
    }

    return { type: 'GENERAL', keywords: [] };
};

// Manejar consultas de ventas
const handleSalesQuery = async (analysis, userId) => {
    const message = analysis.message || '';
    const lowerMessage = message.toLowerCase();

    try {
        // Determinar el periodo de tiempo
        let dateFilter = {};
        const today = new Date();

        if (lowerMessage.includes('hoy')) {
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            dateFilter = { fecha_hora: { $gte: startOfDay } };
        } else if (lowerMessage.includes('semana')) {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - 7);
            dateFilter = { fecha_hora: { $gte: startOfWeek } };
        } else if (lowerMessage.includes('mes')) {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            dateFilter = { fecha_hora: { $gte: startOfMonth } };
        }

        const sales = await Sale.find({
            ...dateFilter,
            estado_venta: 'completada'
        }).populate('productos.producto', 'nombre_producto');

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_general, 0);

        let responseText = '';
        if (lowerMessage.includes('hoy')) {
            responseText = `Hoy has tenido ${totalSales} ventas por un total de $${totalRevenue.toLocaleString()}`;
        } else if (lowerMessage.includes('semana')) {
            responseText = `Esta semana has tenido ${totalSales} ventas por un total de $${totalRevenue.toLocaleString()}`;
        } else {
            responseText = `Este mes has tenido ${totalSales} ventas por un total de $${totalRevenue.toLocaleString()}`;
        }

        return {
            text: responseText,
            data: {
                totalSales,
                totalRevenue,
                avgOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0
            },
            suggestions: [
                '¿Cuál fue mi mejor día de ventas?',
                '¿Qué productos se vendieron más?',
                '¿Cuáles son mis clientes más frecuentes?'
            ]
        };
    } catch (error) {
        return {
            text: 'Lo siento, no pude procesar tu consulta de ventas en este momento.',
            data: null,
            suggestions: []
        };
    }
};

// Manejar consultas de productos
const handleProductsQuery = async (analysis, userId) => {
    const message = analysis.message || '';
    const lowerMessage = message.toLowerCase();

    try {
        if (lowerMessage.includes('poco stock') || lowerMessage.includes('bajo stock')) {
            const lowStockProducts = await Product.find({
                $expr: { $lte: ['$stock_actual', '$stock_minimo'] }
            });

            return {
                text: `Tienes ${lowStockProducts.length} productos con poco stock: ${lowStockProducts.map(p => p.nombre_producto).join(', ')}`,
                data: lowStockProducts,
                suggestions: [
                    '¿Cuáles productos debo reordenar?',
                    '¿Cuál es mi producto más vendido?',
                    '¿Qué productos no se han vendido?'
                ]
            };
        }

        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ stock_actual: { $gt: 0 } });

        return {
            text: `Tienes ${totalProducts} productos registrados, ${activeProducts} con stock disponible.`,
            data: { totalProducts, activeProducts },
            suggestions: [
                'Mostrar productos con poco stock',
                '¿Cuál es mi inventario más valioso?',
                '¿Qué productos tienen más rotación?'
            ]
        };
    } catch (error) {
        return {
            text: 'Lo siento, no pude procesar tu consulta de productos.',
            data: null,
            suggestions: []
        };
    }
};

// Manejar consultas de clientes
const handleCustomersQuery = async (analysis, userId) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ estado_usuario: 'activo' });

        return {
            text: `Tienes ${totalCustomers} clientes registrados, ${activeCustomers} activos.`,
            data: { totalCustomers, activeCustomers },
            suggestions: [
                '¿Quiénes son mis mejores clientes?',
                '¿Qué clientes no han comprado recientemente?',
                '¿Cuál es el ticket promedio por cliente?'
            ]
        };
    } catch (error) {
        return {
            text: 'Lo siento, no pude procesar tu consulta de clientes.',
            data: null,
            suggestions: []
        };
    }
};

const handleReportsQuery = async (analysis, userId) => {
    // Implementar lógica de reportes
    return {
        text: 'Puedo generar varios tipos de reportes para ti.',
        suggestions: [
            'Reporte de ventas del último mes',
            'Productos más vendidos',
            'Análisis de clientes frecuentes'
        ]
    };
};

const handleGeneralQuery = async (message, userId) => {
    return {
        text: 'Puedo ayudarte con consultas sobre ventas, productos, clientes y reportes. ¿Qué te gustaría saber?',
        suggestions: [
            '¿Cuánto vendí hoy?',
            '¿Qué productos tienen poco stock?',
            '¿Cuántos clientes tengo?',
            'Genera un reporte de este mes'
        ]
    };
};

const saveChatHistory = async (userId, query, response) => {
    // Implementar guardado de historial si lo deseas
    // Por ahora lo dejamos vacío
};

export const getChatHistory = async (req, res) => {
    // Implementar obtención de historial
    res.json([]);
};  