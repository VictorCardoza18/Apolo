import api from '../api/axios'

// Obtener todos los proveedores
export const getSuppliers = async () => {
    try {
        const response = await api.get('/suppliers')
        return response.data
    } catch (error) {
        throw error
    }
}

// Crear nuevo proveedor
export const createSupplier = async (supplierData) => {
    try {
        const response = await api.post('/suppliers', supplierData)
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener proveedor por ID
export const getSupplierById = async (id) => {
    try {
        const response = await api.get(`/suppliers/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Actualizar proveedor
export const updateSupplier = async (id, supplierData) => {
    try {
        const response = await api.put(`/suppliers/${id}`, supplierData)
        return response.data
    } catch (error) {
        throw error
    }
}

// Desactivar proveedor
export const deleteSupplier = async (id) => {
    try {
        const response = await api.delete(`/suppliers/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Buscar proveedores
export const searchSuppliers = async (query) => {
    try {
        const response = await api.get(`/suppliers/search?query=${encodeURIComponent(query)}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener productos de un proveedor
export const getSupplierProducts = async (id) => {
    try {
        const response = await api.get(`/suppliers/${id}/products`)
        return response.data
    } catch (error) {
        throw error
    }
}