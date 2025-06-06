import api from '../api/axios'

// Obtener resumen de ventas por período
export const getSalesReport = async (startDate, endDate, filters = {}) => {
    try {
        const params = new URLSearchParams({
            startDate,
            endDate,
            ...filters
        })
        const response = await api.get(`/reports/sales?${params}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener ventas por método de pago
export const getSalesByPaymentMethod = async (startDate, endDate) => {
    try {
        const response = await api.get(`/reports/sales/payment-methods?startDate=${startDate}&endDate=${endDate}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener productos más vendidos
export const getTopSellingProducts = async (startDate, endDate, limit = 10) => {
    try {
        const response = await api.get(`/reports/products/top-selling?startDate=${startDate}&endDate=${endDate}&limit=${limit}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener ventas por vendedor
export const getSalesByVendor = async (startDate, endDate) => {
    try {
        const response = await api.get(`/reports/sales/by-vendor?startDate=${startDate}&endDate=${endDate}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener métricas de rendimiento diario
export const getDailyPerformance = async (startDate, endDate) => {
    try {
        const response = await api.get(`/reports/sales/daily?startDate=${startDate}&endDate=${endDate}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener comparación de períodos
export const getPeriodsComparison = async (currentStart, currentEnd, previousStart, previousEnd) => {
    try {
        const response = await api.get(`/reports/sales/comparison?currentStart=${currentStart}&currentEnd=${currentEnd}&previousStart=${previousStart}&previousEnd=${previousEnd}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Exportar reporte a Excel
export const exportSalesReport = async (startDate, endDate, format = 'excel') => {
    try {
        const response = await api.get(`/reports/sales/export?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
            responseType: 'blob'
        })
        return response.data
    } catch (error) {
        throw error
    }
}