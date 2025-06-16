import axios from 'axios'

// Crear instancia con configuración base
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para manejar tokens
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Manejar errores de autenticación (401)
        if (error.response && error.response.status === 401) {
            // Redirigir al login si el token es inválido o expiró
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api