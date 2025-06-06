import api from '../api/axios'

// Obtener estadísticas completas del dashboard
export const getDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats')
        return response.data
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw error
    }
}

// Obtener productos con stock bajo
export const getLowStockProducts = async () => {
    try {
        const response = await api.get('/dashboard/low-stock')
        return response.data
    } catch (error) {
        console.error('Error fetching low stock products:', error)
        throw error
    }
}

// Obtener ventas recientes
export const getRecentSales = async (limit = 5) => {
    try {
        const response = await api.get(`/dashboard/recent-sales?limit=${limit}`)
        return response.data
    } catch (error) {
        console.error('Error fetching recent sales:', error)
        throw error
    }
}

// Obtener métricas de rendimiento
export const getPerformanceMetrics = async () => {
    try {
        const response = await api.get('/dashboard/performance')
        return response.data
    } catch (error) {
        console.error('Error fetching performance metrics:', error)
        throw error
    }
}

// Obtener predicciones y recomendaciones (simuladas por ahora)
export const getAIInsights = async () => {
    try {
        const response = await api.get('/dashboard/ai-insights')
        return response.data
    } catch (error) {
        console.error('Error fetching AI insights:', error)
        // Por ahora retornamos datos simulados si no existe la API
        return {
            salesPrediction: {
                nextMonthGrowth: Math.floor(Math.random() * 20) + 5,
                confidence: 85
            },
            inventoryRecommendations: Math.floor(Math.random() * 10) + 1,
            customerPatterns: {
                topBuyingHours: ['10:00-12:00', '15:00-17:00', '19:00-21:00'],
                avgOrderValue: Math.floor(Math.random() * 500) + 200
            }
        }
    }
}