// Este servicio se puede integrar con OpenAI, TensorFlow.js u otra biblioteca de IA
// Por ahora, implementaremos funciones básicas que simularán comportamiento inteligente

// Predicción de ventas basada en datos históricos
export const predictSales = (historicalSales) => {
    // Aquí iría algoritmo de predicción (regresión lineal simple como ejemplo)
    // Por ahora usamos un enfoque muy básico

    if (historicalSales.length < 5) {
        return {
            prediction: null,
            confidence: 0,
            message: "Se necesitan más datos históricos para hacer una predicción"
        };
    }

    // Calcular tendencia de las últimas ventas
    const lastFiveSales = historicalSales.slice(-5);
    const totalLastFive = lastFiveSales.reduce((total, sale) => total + sale.amount, 0);
    const avgLastFive = totalLastFive / 5;

    // Calcular tendencia (porcentaje de cambio)
    const prevFiveSales = historicalSales.slice(-10, -5);
    const totalPrevFive = prevFiveSales.reduce((total, sale) => total + sale.amount, 0);
    const avgPrevFive = totalPrevFive / 5;

    const trend = (avgLastFive - avgPrevFive) / avgPrevFive;

    // Predicción simple
    const prediction = avgLastFive * (1 + trend);

    return {
        prediction: Math.round(prediction * 100) / 100,
        confidence: 0.7, // Valor fijo para esta demo
        trend: Math.round(trend * 100),
        message: trend >= 0
            ? "Se espera un incremento en ventas"
            : "Se espera una disminución en ventas"
    };
};

// Recomendaciones para restablecer inventario
export const getInventoryRecommendations = (products, salesData) => {
    const recommendations = [];

    // Para cada producto bajo en stock
    products.forEach(product => {
        if (product.stock_actual <= product.stock_minimo) {
            // Calcular tasa de venta (ventas por día)
            const productSales = salesData.filter(sale =>
                sale.productos.some(item => item.producto.toString() === product._id.toString())
            );

            let totalSold = 0;
            productSales.forEach(sale => {
                sale.productos.forEach(item => {
                    if (item.producto.toString() === product._id.toString()) {
                        totalSold += item.cantidad;
                    }
                });
            });

            // Calcular días desde la primera venta hasta hoy
            const salesDays = productSales.length > 0
                ? Math.max(1, (Date.now() - new Date(productSales[0].fecha_hora).getTime()) / (1000 * 3600 * 24))
                : 30; // Default a 30 días si no hay ventas

            const dailyRate = totalSold / salesDays;

            // Recomendar cantidad a ordenar (para 30 días)
            const recommendedOrder = Math.max(
                product.stock_minimo * 2,
                Math.ceil(dailyRate * 30)
            ) - product.stock_actual;

            recommendations.push({
                productId: product._id,
                codigo_producto: product.codigo_producto,
                nombre_producto: product.nombre_producto,
                stock_actual: product.stock_actual,
                stock_minimo: product.stock_minimo,
                recommended_order: Math.max(1, recommendedOrder),
                priority: product.stock_actual === 0 ? 'Alta' : 'Media',
                estimated_days_until_stockout: product.stock_actual > 0 ? Math.round(product.stock_actual / Math.max(0.1, dailyRate)) : 0
            });
        }
    });

    // Ordenar por prioridad y días hasta quedarse sin stock
    return recommendations.sort((a, b) => {
        if (a.priority === 'Alta' && b.priority !== 'Alta') return -1;
        if (a.priority !== 'Alta' && b.priority === 'Alta') return 1;
        return a.estimated_days_until_stockout - b.estimated_days_until_stockout;
    });
};

// Análisis de patrones de compra de clientes
export const analyzeCustomerPatterns = (customer, salesData) => {
    if (!customer || !salesData || salesData.length === 0) {
        return {
            frequentProducts: [],
            averagePurchase: 0,
            purchaseFrequency: null,
            recommendations: []
        };
    }

    // Filtrar ventas del cliente
    const customerSales = salesData.filter(sale =>
        sale.cliente && sale.cliente.toString() === customer._id.toString()
    );

    if (customerSales.length === 0) {
        return {
            frequentProducts: [],
            averagePurchase: 0,
            purchaseFrequency: null,
            recommendations: []
        };
    }

    // Calcular productos frecuentes
    const productCounts = {};
    customerSales.forEach(sale => {
        sale.productos.forEach(item => {
            const prodId = item.producto.toString();
            if (!productCounts[prodId]) {
                productCounts[prodId] = {
                    count: 0,
                    totalQuantity: 0,
                    name: item.nombre_producto || 'Producto desconocido'
                };
            }
            productCounts[prodId].count += 1;
            productCounts[prodId].totalQuantity += item.cantidad;
        });
    });

    const frequentProducts = Object.entries(productCounts)
        .map(([id, data]) => ({
            productId: id,
            name: data.name,
            purchaseCount: data.count,
            totalQuantity: data.totalQuantity
        }))
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 5);

    // Calcular promedio de compra
    const totalPurchase = customerSales.reduce((sum, sale) => sum + sale.total_general, 0);
    const averagePurchase = totalPurchase / customerSales.length;

    // Calcular frecuencia de compra (días promedio entre compras)
    const sortedDates = customerSales
        .map(sale => new Date(sale.fecha_hora))
        .sort((a, b) => a - b);

    let totalDaysBetweenPurchases = 0;
    let purchaseFrequency = null;

    if (sortedDates.length > 1) {
        for (let i = 1; i < sortedDates.length; i++) {
            const daysDiff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 3600 * 24);
            totalDaysBetweenPurchases += daysDiff;
        }
        purchaseFrequency = Math.round(totalDaysBetweenPurchases / (sortedDates.length - 1));
    }

    // Generar recomendaciones básicas
    const allProducts = new Set();
    const customerProducts = new Set(frequentProducts.map(p => p.productId));

    salesData.forEach(sale => {
        sale.productos.forEach(item => {
            allProducts.add(item.producto.toString());
        });
    });

    const recommendations = Array.from(allProducts)
        .filter(prodId => !customerProducts.has(prodId))
        .slice(0, 3);

    return {
        frequentProducts,
        averagePurchase,
        purchaseFrequency,
        recommendations
    };
};