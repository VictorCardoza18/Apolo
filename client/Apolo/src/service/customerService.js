import api from '../api/axios'

// Obtener todos los clientes
export const getCustomers = async () => {
    try {
        const response = await api.get('/customers')
        return response.data
    } catch (error) {
        throw error
    }
}

// Obtener un cliente por ID
export const getCustomerById = async (id) => {
    try {
        const response = await api.get(`/customers/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Crear un nuevo cliente
export const createCustomer = async (customerData) => {
    try {
        const response = await api.post('/customers', customerData)
        return response.data
    } catch (error) {
        throw error
    }
}

// Actualizar un cliente
export const updateCustomer = async (id, customerData) => {
    try {
        const response = await api.put(`/customers/${id}`, customerData)
        return response.data
    } catch (error) {
        throw error
    }
}

// Desactivar un cliente (eliminación lógica)
export const deleteCustomer = async (id) => {
    try {
        const response = await api.delete(`/customers/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Buscar clientes
export const searchCustomers = async (query) => {
    try {
        const response = await api.get(`/customers/search?query=${encodeURIComponent(query)}`)
        return response.data
    } catch (error) {
        throw error
    }
}