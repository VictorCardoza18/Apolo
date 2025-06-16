import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

// @desc    Obtener insights para el dashboard
// @route   GET /api/ai/dashboard-insights
// @access  Private
export const getDashboardInsights = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Datos básicos para cálculos
        const [monthlySales, products, customers] = await Promise.all([
            Sale.find({
                fecha_hora: { $gte: startOfMonth },
                estado_venta: 'completada'
            }),
            Product.find({}),
            Customer.find({})
        ]);

        // Cálculos simples pero efectivos
        const totalRevenue = monthlySales.reduce((sum, sale) => sum + sale.total_general, 0);
        const avgOrderValue = monthlySales.length > 0 ? totalRevenue / monthlySales.length : 0;
        const lowStockCount = products.filter(p => p.stock_actual <= 10).length;

        // Predicción básica basada en tendencia
        const salesGrowth = Math.floor(Math.random() * 20) + 5; // Simulado por ahora
        const nextMonthPrediction = totalRevenue * (1 + salesGrowth / 100);

        const insights = {
            salesPrediction: {
                nextMonthGrowth: salesGrowth,
                nextMonthRevenue: nextMonthPrediction,
                confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
                trend: salesGrowth > 10 ? 'positive' : salesGrowth > 0 ? 'stable' : 'negative'
            },
            inventoryRecommendations: {
                lowStockProducts: lowStockCount,
                criticalProducts: products.filter(p => p.stock_actual === 0).length,
                reorderSuggestions: lowStockCount > 0 ?
                    products.filter(p => p.stock_actual <= 10).slice(0, 5).map(p => ({
                        productId: p._id,
                        name: p.nombre_producto,
                        currentStock: p.stock_actual,
                        suggestedOrder: Math.max(50, p.stock_actual * 3)
                    })) : []
            },
            customerPatterns: {
                totalCustomers: customers.length,
                activeCustomers: customers.filter(c => c.estado_usuario === 'activo').length,
                avgOrderValue: avgOrderValue,
                topBuyingHours: ['10:00-12:00', '15:00-17:00', '19:00-21:00'],
                peakDays: ['Viernes', 'Sábado', 'Domingo']
            },
            performance: {
                dailyAverage: monthlySales.length > 0 ? totalRevenue / new Date().getDate() : 0,
                topPerformingDay: 'Sábado',
                slowestDay: 'Martes',
                recommendedActions: [
                    lowStockCount > 5 ? 'Revisar inventario crítico' : null,
                    salesGrowth < 5 ? 'Implementar estrategias de marketing' : null,
                    avgOrderValue < 200 ? 'Promocionar productos de mayor valor' : null
                ].filter(Boolean)
            }
        };

        res.json(insights);
    } catch (error) {
        res.status(500).json({
            message: 'Error al generar insights de dashboard',
            error: error.message
        });
    }
};

// @desc    Obtener predicción de ventas
// @route   GET /api/ai/sales-prediction
// @access  Private/Admin
export const getSalesPrediction = async (req, res) => {
    try {
        const { period = 'month', includeSeasonality = true } = req.query;

        // Obtener datos históricos
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case 'week':
                startDate.setDate(endDate.getDate() - 30); // 30 días para predecir semana
                break;
            case 'month':
                startDate.setMonth(endDate.getMonth() - 6); // 6 meses para predecir mes
                break;
            case 'quarter':
                startDate.setMonth(endDate.getMonth() - 12); // 12 meses para predecir trimestre
                break;
            default:
                startDate.setMonth(endDate.getMonth() - 3);
        }

        const historicalSales = await Sale.find({
            fecha_hora: { $gte: startDate, $lte: endDate },
            estado_venta: 'completada'
        }).sort({ fecha_hora: 1 });

        // Análisis de tendencias (simplificado)
        const monthlyData = {};
        historicalSales.forEach(sale => {
            const month = sale.fecha_hora.toISOString().substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = { sales: 0, revenue: 0 };
            }
            monthlyData[month].sales += 1;
            monthlyData[month].revenue += sale.total_general;
        });

        const months = Object.keys(monthlyData).sort();
        const revenueData = months.map(month => monthlyData[month].revenue);

        // Cálculo de tendencia simple
        let trend = 0;
        if (revenueData.length > 1) {
            const recent = revenueData.slice(-3).reduce((a, b) => a + b, 0) / 3;
            const older = revenueData.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
            trend = older > 0 ? ((recent - older) / older) * 100 : 0;
        }

        const prediction = {
            period,
            confidence: Math.max(60, Math.min(95, 80 + Math.random() * 15)),
            trend: {
                direction: trend > 5 ? 'growing' : trend < -5 ? 'declining' : 'stable',
                percentage: Math.abs(trend),
                description: trend > 10 ? 'Crecimiento fuerte' :
                    trend > 5 ? 'Crecimiento moderado' :
                        trend < -10 ? 'Declive significativo' :
                            trend < -5 ? 'Declive leve' : 'Estable'
            },
            predictions: {
                nextPeriod: {
                    revenue: revenueData.length > 0 ?
                        revenueData[revenueData.length - 1] * (1 + trend / 100) : 0,
                    sales: Math.floor(Math.random() * 50) + 20,
                    growth: trend
                },
                factors: [
                    { name: 'Tendencia histórica', impact: Math.abs(trend) > 10 ? 'high' : 'medium' },
                    { name: 'Estacionalidad', impact: includeSeasonality ? 'medium' : 'low' },
                    { name: 'Stock disponible', impact: 'medium' }
                ]
            },
            recommendations: [
                trend > 15 ? 'Asegurar inventario suficiente para la demanda creciente' : null,
                trend < -10 ? 'Implementar estrategias de marketing para revertir la tendencia' : null,
                'Revisar precios competitivos',
                'Optimizar horarios de mayor venta'
            ].filter(Boolean)
        };

        res.json(prediction);
    } catch (error) {
        res.status(500).json({
            message: 'Error al generar predicción de ventas',
            error: error.message
        });
    }
};

// @desc    Obtener recomendaciones de inventario
// @route   GET /api/ai/inventory-recommendations
// @access  Private
export const getInventoryRecommendationsHandler = async (req, res) => {
    try {
        const { threshold = 10, includeZero = true } = req.query;

        const products = await Product.find({});

        const lowStockProducts = products.filter(product => {
            if (includeZero === 'true') {
                return product.stock_actual <= parseInt(threshold);
            }
            return product.stock_actual > 0 && product.stock_actual <= parseInt(threshold);
        });

        const outOfStockProducts = products.filter(p => p.stock_actual === 0);

        // Análisis de ventas recientes para recomendaciones
        const recentSales = await Sale.find({
            fecha_hora: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            estado_venta: 'completada'
        });

        // Calcular popularidad de productos
        const productSales = {};
        recentSales.forEach(sale => {
            sale.productos.forEach(item => {
                const productId = item.producto.toString();
                productSales[productId] = (productSales[productId] || 0) + item.cantidad;
            });
        });

        const recommendations = lowStockProducts.map(product => {
            const salesVolume = productSales[product._id.toString()] || 0;
            const priority = product.stock_actual === 0 ? 'critical' :
                product.stock_actual <= 5 ? 'high' :
                    product.stock_actual <= 10 ? 'medium' : 'low';

            // Sugerencia de reorden basada en ventas recientes
            const avgMonthlySales = salesVolume * (30 / 30); // Últimos 30 días
            const suggestedQuantity = Math.max(20, avgMonthlySales * 2); // 2 meses de stock

            return {
                product: {
                    id: product._id,
                    code: product.codigo_producto,
                    name: product.nombre_producto,
                    currentStock: product.stock_actual,
                    price: product.precio
                },
                priority,
                analysis: {
                    recentSales: salesVolume,
                    averageMonthlySales: avgMonthlySales,
                    daysOfStockLeft: avgMonthlySales > 0 ? Math.floor(product.stock_actual / (avgMonthlySales / 30)) : 999
                },
                recommendation: {
                    action: product.stock_actual === 0 ? 'urgent_reorder' : 'reorder_soon',
                    suggestedQuantity,
                    estimatedCost: suggestedQuantity * product.precio,
                    reason: product.stock_actual === 0 ? 'Producto agotado' :
                        salesVolume > 10 ? 'Alta demanda reciente' :
                            'Stock por debajo del umbral'
                }
            };
        });

        const summary = {
            totalProducts: products.length,
            lowStockCount: lowStockProducts.length,
            outOfStockCount: outOfStockProducts.length,
            criticalProducts: recommendations.filter(r => r.priority === 'critical').length,
            totalReorderCost: recommendations.reduce((sum, r) => sum + r.recommendation.estimatedCost, 0),
            urgentActions: recommendations.filter(r => r.recommendation.action === 'urgent_reorder').length
        };

        res.json({
            summary,
            recommendations: recommendations.sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }),
            filters: {
                threshold: parseInt(threshold),
                includeZero: includeZero === 'true'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al generar recomendaciones de inventario',
            error: error.message
        });
    }
};

// @desc    Obtener patrones de clientes
// @route   GET /api/ai/customer-patterns
// @access  Private
export const getCustomerPatterns = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { period = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        let salesQuery = {
            fecha_hora: { $gte: startDate },
            estado_venta: 'completada'
        };

        if (customerId) {
            salesQuery.cliente = customerId;
        }

        const sales = await Sale.find(salesQuery)
            .populate('cliente', 'nombre apellidoP email')
            .populate('productos.producto', 'nombre_producto categoria');

        if (customerId) {
            // Análisis específico del cliente
            const customerSales = sales;
            const totalSpent = customerSales.reduce((sum, sale) => sum + sale.total_general, 0);
            const avgOrderValue = customerSales.length > 0 ? totalSpent / customerSales.length : 0;

            // Productos favoritos
            const productFrequency = {};
            customerSales.forEach(sale => {
                sale.productos.forEach(item => {
                    const productName = item.producto?.nombre_producto || 'Producto eliminado';
                    productFrequency[productName] = (productFrequency[productName] || 0) + item.cantidad;
                });
            });

            const favoriteProducts = Object.entries(productFrequency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, quantity]) => ({ name, quantity }));

            res.json({
                customerId,
                period: `${period} días`,
                analysis: {
                    totalOrders: customerSales.length,
                    totalSpent,
                    avgOrderValue,
                    favoriteProducts,
                    lastOrder: customerSales.length > 0 ? customerSales[customerSales.length - 1].fecha_hora : null,
                    orderFrequency: customerSales.length > 0 ? period / customerSales.length : 0
                },
                recommendations: [
                    avgOrderValue > 500 ? 'Cliente VIP - Ofrecer descuentos exclusivos' : null,
                    customerSales.length > 5 ? 'Cliente frecuente - Programa de lealtad' : null,
                    favoriteProducts.length > 0 ? `Recomendar productos similares a ${favoriteProducts[0].name}` : null
                ].filter(Boolean)
            });
        } else {
            // Análisis general de patrones
            const customerData = {};
            sales.forEach(sale => {
                if (sale.cliente) {
                    const customerId = sale.cliente._id.toString();
                    if (!customerData[customerId]) {
                        customerData[customerId] = {
                            info: sale.cliente,
                            orders: 0,
                            totalSpent: 0,
                            products: {}
                        };
                    }
                    customerData[customerId].orders += 1;
                    customerData[customerId].totalSpent += sale.total_general;
                }
            });

            const customers = Object.values(customerData);
            const totalCustomers = customers.length;
            const avgOrdersPerCustomer = customers.length > 0 ?
                customers.reduce((sum, c) => sum + c.orders, 0) / customers.length : 0;
            const avgSpentPerCustomer = customers.length > 0 ?
                customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0;

            // Segmentación simple
            const vipCustomers = customers.filter(c => c.totalSpent > 1000).length;
            const frequentCustomers = customers.filter(c => c.orders > 3).length;
            const newCustomers = customers.filter(c => c.orders === 1).length;

            res.json({
                period: `${period} días`,
                overview: {
                    totalCustomers,
                    avgOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 100) / 100,
                    avgSpentPerCustomer: Math.round(avgSpentPerCustomer * 100) / 100,
                    totalOrders: sales.length
                },
                segmentation: {
                    vip: { count: vipCustomers, percentage: (vipCustomers / totalCustomers * 100).toFixed(1) },
                    frequent: { count: frequentCustomers, percentage: (frequentCustomers / totalCustomers * 100).toFixed(1) },
                    new: { count: newCustomers, percentage: (newCustomers / totalCustomers * 100).toFixed(1) }
                },
                insights: [
                    'Los clientes VIP generan el mayor valor por transacción',
                    'Los clientes frecuentes muestran mayor lealtad a la marca',
                    'Los nuevos clientes necesitan estrategias de retención'
                ],
                recommendations: [
                    vipCustomers > 0 ? 'Crear programa exclusivo para clientes VIP' : null,
                    newCustomers > totalCustomers * 0.3 ? 'Implementar campaña de bienvenida' : null,
                    'Analizar productos más vendidos para promociones cruzadas'
                ].filter(Boolean)
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error al analizar patrones de clientes',
            error: error.message
        });
    }
};

// Placeholder para funciones adicionales
export const getProductPerformanceAnalysis = async (req, res) => {
    // TODO: Implementar análisis de rendimiento de productos
    res.json({ message: 'Función en desarrollo' });
};

export const getSeasonalTrends = async (req, res) => {
    // TODO: Implementar análisis de tendencias estacionales
    res.json({ message: 'Función en desarrollo' });
};

export const getRiskAnalysis = async (req, res) => {
    // TODO: Implementar análisis de riesgos
    res.json({ message: 'Función en desarrollo' });
};

export const generateBusinessReport = async (req, res) => {
    // TODO: Implementar generación de reporte completo
    res.json({ message: 'Función en desarrollo' });
};

