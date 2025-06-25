import express from 'express';
import {
    processChatQuery,
    getChatHistory,
    cleanOldHistory,
    getChatStats
} from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware para agregar timestamp de inicio (para medir tiempo de procesamiento)
router.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

// @desc    Procesar consulta de chat inteligente
// @route   POST /api/chat/query
// @access  Private
router.post('/query', protect, processChatQuery);

// @desc    Obtener historial de conversaciones del usuario
// @route   GET /api/chat/history
// @access  Private
// Query params: ?limit=50&page=1
router.get('/history', protect, getChatHistory);

// @desc    Obtener estadísticas de uso del chat
// @route   GET /api/chat/stats
// @access  Private
router.get('/stats', protect, getChatStats);

// @desc    Limpiar historial antiguo
// @route   DELETE /api/chat/history/cleanup
// @access  Private
// Body: { days: 90 } - Días a mantener (por defecto 90)
router.delete('/history/cleanup', protect, cleanOldHistory);

// @desc    Obtener sugerencias contextuales
// @route   GET /api/chat/suggestions
// @access  Private
router.get('/suggestions', protect, (req, res) => {
    const suggestions = {
        popular: [
            '¿Cuánto vendí hoy?',
            '¿Qué productos tienen poco stock?',
            '¿Quiénes son mis mejores clientes?',
            'Reporte de ventas del mes'
        ],
        sales: [
            'Ventas de esta semana',
            'Comparar ventas con mes anterior',
            'Productos más vendidos hoy',
            '¿Cuál fue mi mejor día de ventas?'
        ],
        products: [
            'Productos con stock bajo',
            'Artículos más rentables',
            'Inventario por categorías',
            '¿Qué productos no se han vendido?'
        ],
        customers: [
            'Clientes más frecuentes',
            'Nuevos clientes este mes',
            'Clientes inactivos',
            'Análisis de comportamiento de compra'
        ],
        reports: [
            'Reporte mensual completo',
            'Análisis de tendencias',
            'Métricas del negocio',
            'Proyección de ventas'
        ]
    };

    res.json({
        suggestions,
        timestamp: new Date(),
        user: req.user._id
    });
});

// @desc    Exportar conversación como PDF/Excel
// @route   POST /api/chat/export
// @access  Private
router.post('/export', protect, async (req, res) => {
    try {
        const { format = 'json', dateRange } = req.body;
        const userId = req.user._id;

        // Construir filtro de fecha si se proporciona
        let dateFilter = { usuario: userId };
        if (dateRange && dateRange.start && dateRange.end) {
            dateFilter.fecha_consulta = {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end)
            };
        }

        const history = await ChatHistory.find(dateFilter)
            .sort({ fecha_consulta: -1 })
            .populate('usuario', 'nombre email');

        if (format === 'json') {
            res.json({
                export: history,
                metadata: {
                    totalRecords: history.length,
                    exportDate: new Date(),
                    user: req.user.nombre,
                    dateRange: dateRange || 'all'
                }
            });
        } else {
            // Para futuras implementaciones de PDF/Excel
            res.status(400).json({
                message: 'Formato no soportado actualmente',
                supportedFormats: ['json']
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error exportando historial',
            error: error.message
        });
    }
});

// @desc    Obtener métricas de rendimiento del chat
// @route   GET /api/chat/performance
// @access  Private
router.get('/performance', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const metrics = await ChatHistory.aggregate([
            {
                $match: {
                    usuario: userId,
                    fecha_consulta: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    totalQueries: { $sum: 1 },
                    avgConfidence: { $avg: '$metadata.confidence' },
                    avgProcessingTime: { $avg: '$metadata.processingTime' },
                    successfulQueries: {
                        $sum: {
                            $cond: [{ $gte: ['$metadata.confidence', 0.7] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const queryTypes = await ChatHistory.aggregate([
            {
                $match: {
                    usuario: userId,
                    fecha_consulta: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$tipo_consulta',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            metrics: metrics[0] || {
                totalQueries: 0,
                avgConfidence: 0,
                avgProcessingTime: 0,
                successfulQueries: 0
            },
            queryTypes,
            period: '30 días',
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error obteniendo métricas',
            error: error.message
        });
    }
});

// @desc    Feedback sobre respuesta del chat
// @route   POST /api/chat/feedback
// @access  Private
router.post('/feedback', protect, async (req, res) => {
    try {
        const { chatHistoryId, rating, comment } = req.body;
        const userId = req.user._id;

        // Validar que el registro pertenece al usuario
        const chatEntry = await ChatHistory.findOne({
            _id: chatHistoryId,
            usuario: userId
        });

        if (!chatEntry) {
            return res.status(404).json({
                message: 'Entrada de chat no encontrada'
            });
        }

        // Actualizar con feedback
        chatEntry.feedback = {
            rating: Math.max(1, Math.min(5, rating)), // Entre 1 y 5
            comment: comment?.trim() || '',
            fecha: new Date()
        };

        await chatEntry.save();

        res.json({
            message: 'Feedback guardado exitosamente',
            feedback: chatEntry.feedback
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error guardando feedback',
            error: error.message
        });
    }
});

// @desc    Obtener comandos disponibles y ayuda
// @route   GET /api/chat/help
// @access  Private
router.get('/help', protect, (req, res) => {
    const helpData = {
        commands: {
            sales: {
                description: 'Consultas sobre ventas y facturación',
                examples: [
                    '¿Cuánto vendí hoy?',
                    'Ventas de esta semana',
                    'Ingresos del mes pasado',
                    '¿Cuál fue mi mejor día de ventas?'
                ]
            },
            products: {
                description: 'Información sobre productos e inventario',
                examples: [
                    '¿Qué productos tienen poco stock?',
                    'Productos más vendidos',
                    'Lista de productos agotados',
                    'Análisis de rotación de inventario'
                ]
            },
            customers: {
                description: 'Datos y análisis de clientes',
                examples: [
                    '¿Quiénes son mis mejores clientes?',
                    'Clientes nuevos este mes',
                    'Lista de clientes inactivos',
                    'Ticket promedio por cliente'
                ]
            },
            reports: {
                description: 'Reportes y análisis avanzados',
                examples: [
                    'Reporte mensual de ventas',
                    'Análisis de tendencias',
                    'Métricas del negocio',
                    'Comparativa con períodos anteriores'
                ]
            }
        },
        tips: [
            'Puedes usar frases naturales, no necesitas comandos específicos',
            'Especifica períodos de tiempo: "hoy", "esta semana", "este mes"',
            'Pregunta por comparaciones: "comparar con mes anterior"',
            'Solicita detalles específicos: "productos con stock menor a 10"'
        ],
        shortcuts: [
            'h = ayuda',
            'v = ventas del día',
            'p = productos con stock bajo',
            'c = resumen de clientes',
            'r = reporte del mes'
        ]
    };

    res.json({
        help: helpData,
        version: '2.0',
        lastUpdated: new Date('2024-01-15'),
        contact: 'Escribe "contactar soporte" para más ayuda'
    });
});

export default router;