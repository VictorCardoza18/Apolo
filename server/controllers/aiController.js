import {
    predictSales,
    getInventoryRecommendations,
    analyzeCustomerPatterns
} from '../services/aiService.js';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

// @desc    Obtener predicción de ventas
// @route   GET /api/ai/sales-prediction
// @access  Private/Admin
export const getSalesPrediction = async (req, res) => {
    try {
        const { months = 3 } = req.query;

        // Obtener ventas completadas de los últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const sales = await Sale.find({
            fecha_hora: { $gte: sixMonthsAgo },
            estado_venta: 'completada'
        }).sort({ fecha_hora: 1 });

        // Agrupar por mes para análisis
        const monthlySales = [];
        const monthMap = {};

        sales.forEach(sale => {
            const date = new Date(sale.fecha_hora);
            const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;

            if (!monthMap[monthYear]) {
                monthMap[monthYear] = {
                    month: monthYear,
                    amount: 0,
                    count: 0
                };
                monthlySales.push(monthMap[monthYear]);
            }

            monthMap[monthYear].amount += sale.total_general;
            monthMap[monthYear].count += 1;
        });

        // Generar predicción
        const prediction = predictSales(monthlySales);

        res.json({
            historicalData: monthlySales,
            prediction,
            months: parseInt(months)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar predicción de ventas', error: error.message });
    }
};

// @desc    Obtener recomendaciones de inventario
// @route   GET /api/ai/inventory-recommendations
// @access  Private
export const getInventoryRecommendationsHandler = async (req, res) => {
    try {
        // Obtener productos con stock bajo
        const lowStockProducts = await Product.find({
            $expr: { $lte: ["$stock_actual", "$stock_minimo"] }
        });

        // Obtener datos de ventas recientes para análisis
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const sales = await Sale.find({
            fecha_hora: { $gte: threeMonthsAgo },
            estado_venta: 'completada'
        });

        // Generar recomendaciones
        const recommendations = getInventoryRecommendations(lowStockProducts, sales);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({
            message: 'Error al generar recomendaciones de inventario',
            error: error.message
        });
    }
};

// @desc    Analizar patrones de compra de un cliente
// @route   GET /api/ai/customer-patterns/:id
// @access  Private
export const getCustomerPatterns = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Obtener ventas del cliente
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const sales = await Sale.find({
            cliente: customer._id,
            fecha_hora: { $gte: sixMonthsAgo },
            estado_venta: 'completada'
        })
            .populate('productos.producto', 'codigo_producto nombre_producto');

        // Obtener todas las ventas recientes para recomendaciones
        const allSales = await Sale.find({
            fecha_hora: { $gte: sixMonthsAgo },
            estado_venta: 'completada'
        })
            .populate('productos.producto', 'codigo_producto nombre_producto');

        // Analizar patrones
        const patterns = analyzeCustomerPatterns(customer, sales, allSales);

        res.json({
            cliente: {
                _id: customer._id,
                codigo_cliente: customer.codigo_cliente,
                nombre: `${customer.nombre} ${customer.apellidoP} ${customer.apellidoM}`,
            },
            patterns
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al analizar patrones de cliente',
            error: error.message
        });
    }
};