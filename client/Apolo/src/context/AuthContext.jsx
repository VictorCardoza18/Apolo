import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Cargar el usuario desde localStorage al iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)

            // Configurar token para todas las peticiones
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`
        }
        setLoading(false)
    }, [])

    // Función para iniciar sesión
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', {
                email,
                password
            })

            const userData = response.data
            console.log('Usuario autenticado:', userData);


            // Guardar información del usuario en localStorage
            localStorage.setItem('user', JSON.stringify(userData))

            // Configurar token para todas las peticiones
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`

            setUser(userData)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al iniciar sesión'
            }
        }
    }

    // Función para registrarse
    const register = async (username, email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/users', {
                username,
                email,
                password
            })

            const userData = response.data

            // Guardar información del usuario en localStorage
            localStorage.setItem('user', JSON.stringify(userData))

            // Configurar token para todas las peticiones
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`

            setUser(userData)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al registrarse'
            }
        }
    }

    // Función para cerrar sesión
    const logout = () => {
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
        setUser(null)
    }

    // Verificar si el usuario está autenticado
    const isAuthenticated = () => !!user

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider')
    }
    return context
}