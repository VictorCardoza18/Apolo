import api from '../api/axios'

// Obtener todos los usuarios (solo admin)
export const getUsers = async () => {
    try {
        const response = await api.get('/users')
        return response.data
    } catch (error) {
        console.log('Error fetching users:', error);
        throw error
    }
}

// Crear nuevo usuario (solo admin)
export const createUser = async (userData) => {
    try {
        const response = await api.post('/users/create', userData)
        return response.data
    } catch (error) {
        console.log('Error creating user:', error);
        throw error
    }
}

// Actualizar usuario (solo admin)
export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/users/${id}`, userData)
        return response.data
    } catch (error) {
        console.log(`Error updating user with id ${id}:`, error);
        throw error
    }
}

// Desactivar usuario (solo admin)
export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`)
        return response.data
    } catch (error) {
        console.log(`Error deleting user with id ${id}:`, error);
        throw error
    }
}

// Cambiar contraseña de usuario (solo admin)
export const changeUserPassword = async (id, passwordData) => {
    try {
        const response = await api.put(`/users/${id}/password`, passwordData)
        return response.data
    } catch (error) {
        console.log(`Error changing password for user with id ${id}:`, error);
        throw error
    }
}

// Generar token de recuperación (solo admin)
export const generateResetToken = async (id) => {
    try {
        const response = await api.post(`/users/${id}/reset-token`)
        return response.data
    } catch (error) {
        console.log(`Error generating reset token for user with id ${id}:`, error);
        throw error
    }
}