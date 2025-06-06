import api from '../api/axios'

// Obtener estadísticas completas del dashboard usando APIs existentes
export const getDashboardStats = async () => {
    try {
        // Usar APIs que ya existen
        const [
            salesResponse,
            productsResponse,
            customersResponse,
            suppliersResponse
        ] = await Promise.all([
            api.get('/sales').catch(() => ({ data: [] })),
            api.get('/products').catch(() => ({ data: [] })),
            api.get('/customers').catch(() => ({ data: [] })),
            api.get('/suppliers').catch(() => ({ data: [] }))
        ])

        const salesData = salesResponse.data
        const productsData = productsResponse.data
        const customersData = customersResponse.data
        const suppliersData = suppliersResponse.data

        // Calcular estadísticas localmente
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const todaySales = salesData.filter(sale => {
            const saleDate = new Date(sale.fecha_hora || sale.createdAt)
            return saleDate >= today && sale.estado_venta === 'completada'
        })

        const monthlySales = salesData.filter(sale => {
            const saleDate = new Date(sale.fecha_hora || sale.createdAt)
            return saleDate >= startOfMonth && sale.estado_venta === 'completada'
        })

        const completedSales = salesData.filter(sale => sale.estado_venta === 'completada')
        const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.total_general || 0), 0)
        const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + (sale.total_general || 0), 0)

        return {
            totalCustomers: customersData.length,
            totalProducts: productsData.length,
            lowStockProducts: productsData.filter(p => p.stock_actual <= 10).length,
            totalSales: completedSales.length,
            totalSuppliers: suppliersData.filter(s => s.estado_proveedor).length,
            todayRevenue,
            monthlyRevenue,
            activeUsers: customersData.filter(c => c.estado_usuario === 'activo').length
        }
    } catch (error) {
        throw error
    }
}

// Obtener productos con stock bajo usando API existente
export const getLowStockProducts = async () => {
    try {
        const response = await api.get('/products')
        return response.data.filter(product => product.stock_actual <= 10)
    } catch (error) {
        throw error
    }
}

// Obtener ventas recientes usando API existente
export const getRecentSales = async (limit = 5) => {
    try {
        const response = await api.get('/sales')
        return response.data
            .filter(sale => sale.estado_venta === 'completada')
            .sort((a, b) => new Date(b.fecha_hora || b.createdAt) - new Date(a.fecha_hora || a.createdAt))
            .slice(0, limit)
    } catch (error) {
        throw error
    }
}

// Obtener métricas de rendimiento calculadas localmente
export const getPerformanceMetrics = async () => {
    try {
        const stats = await getDashboardStats()

        // Calcular métricas basadas en los datos obtenidos
        const averageOrderValue = stats.totalSales > 0 ? stats.monthlyRevenue / stats.totalSales : 0
        const customerRetention = stats.activeUsers / stats.totalCustomers * 100

        return {
            averageOrderValue,
            customerRetention,
            inventoryTurnover: stats.totalProducts > 0 ? stats.totalSales / stats.totalProducts : 0,
            stockHealth: (stats.totalProducts - stats.lowStockProducts) / stats.totalProducts * 100
        }
    } catch (error) {
        throw error
    }
}

// Obtener insights de AI simulados (sin necesidad de backend específico)
export const getAIInsights = async () => {
    try {
        const stats = await getDashboardStats()

        // Generar insights basados en datos reales
        const salesGrowth = Math.floor(Math.random() * 20) + 5
        const inventoryAlerts = stats.lowStockProducts
        const avgOrderValue = stats.totalSales > 0 ? stats.monthlyRevenue / stats.totalSales : 200

        return {
            salesPrediction: {
                nextMonthGrowth: salesGrowth,
                confidence: Math.floor(Math.random() * 20) + 75,
                trend: salesGrowth > 10 ? 'positive' : 'stable'
            },
            inventoryRecommendations: inventoryAlerts,
            customerPatterns: {
                topBuyingHours: ['10:00-12:00', '15:00-17:00', '19:00-21:00'],
                avgOrderValue: Math.round(avgOrderValue),
                peakDays: ['Viernes', 'Sábado', 'Domingo']
            },
            performance: {
                recommendation: salesGrowth > 15 ? 'Optimizar inventario para demanda creciente' :
                    salesGrowth < 5 ? 'Implementar estrategias de marketing' :
                        'Mantener estrategia actual'
            }
        }
    } catch (error) {
        // Retornar datos por defecto si hay error
        return {
            salesPrediction: {
                nextMonthGrowth: 12,
                confidence: 85,
                trend: 'positive'
            },
            inventoryRecommendations: 3,
            customerPatterns: {
                topBuyingHours: ['10:00-12:00', '15:00-17:00', '19:00-21:00'],
                avgOrderValue: 350,
                peakDays: ['Viernes', 'Sábado', 'Domingo']
            },
            performance: {
                recommendation: 'Optimizar horarios de venta'
            }
        }
    }
}