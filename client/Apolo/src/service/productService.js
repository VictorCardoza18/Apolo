import api from '../api/axios'

// Obtener todos los productos
export const getProducts = async () => {
    try {
        const response = await api.get('/products')
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener producto por ID
export const getProductById = async (id) => {
    try {
        const response = await api.get(`/products/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Crear nuevo producto
export const createProduct = async (productData) => {
    try {
        const response = await api.post('/products', productData)
        return response.data
    } catch (error) {
        throw error
    }
}

// Actualizar producto
export const updateProduct = async (id, productData) => {
    try {
        const response = await api.put(`/products/${id}`, productData)
        return response.data
    } catch (error) {
        throw error
    }
}

// Eliminar producto
export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/products/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Buscar productos
export const searchProducts = async (query) => {
    try {
        const response = await api.get(`/products/search?query=${encodeURIComponent(query)}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener productos con stock bajo
export const getLowStockProducts = async () => {
    try {
        const response = await api.get('/products/low-stock')
        return response.data
    } catch (error) {
        throw error
    }
}

// Actualizar stock
export const updateStock = async (id, stockData) => {
    try {
        const response = await api.put(`/products/${id}/stock`, stockData)
        return response.data
    } catch (error) {
        throw error
    }
}