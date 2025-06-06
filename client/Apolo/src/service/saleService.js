import api from '../api/axios'

// Obtener todas las ventas
export const getSales = async () => {
    try {
        const response = await api.get('/sales')
        return response.data
    } catch (error) {
        console.error('Error fetching sales:', error)
        throw error
    }
}

// Crear nueva venta
export const createSale = async (saleData) => {
    try {
        const response = await api.post('/sales', saleData)
        return response.data
    } catch (error) {
        console.error('Error creating sale:', error)
        throw error
    }
}

// Obtener productos y clientes para POS
export const getProducts = async () => {
    try {
        const response = await api.get('/sales/pos/products')
        return response.data.products // Solo devolver los productos
    } catch (error) {
        // Fallback a la ruta de productos si no existe la del POS
        try {
            const fallbackResponse = await api.get('/products')
            return fallbackResponse.data
        } catch (fallbackError) {
            console.error('Error fetching products:', fallbackError)
            throw error
        }
    }
}

// Obtener clientes para POS
export const getCustomers = async () => {
    try {
        const response = await api.get('/sales/pos/products')
        return response.data.customers // Solo devolver los clientes
    } catch (error) {
        // Fallback a la ruta de clientes si no existe la del POS
        try {
            const fallbackResponse = await api.get('/customers')
            return fallbackResponse.data
        } catch (fallbackError) {
            console.error('Error fetching customers:', fallbackError)
            throw error
        }
    }
}

// Resto de funciones...
export const getSaleById = async (id) => {
    try {
        const response = await api.get(`/sales/${id}`)
        return response.data
    } catch (error) {
        console.error('Error fetching sale by ID:', error)
        throw error
    }
}

export const updateSaleStatus = async (id, statusData) => {
    try {
        const response = await api.put(`/sales/${id}/status`, statusData)
        return response.data
    } catch (error) {
        console.error('Error updating sale status:', error)
        throw error
    }
}

export const getSalesByDateRange = async (startDate, endDate) => {
    try {
        const response = await api.get(`/sales/by-date?startDate=${startDate}&endDate=${endDate}`)
        return response.data
    } catch (error) {
        console
        throw error
    }
}