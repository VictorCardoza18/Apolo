import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user } = useAuth()

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    // Si el usuario no está activo, redirigir al login
    if (!user?.isActive) {
        return <Navigate to="/login" replace />
    }

    // Si la ruta requiere permisos de administrador
    if (adminOnly) {
        const isAdmin = user?.role === 'admin' || user?.isAdmin
        if (!isAdmin) {
            return <Navigate to="/pos" replace />
        }
    }

    return children
}

// Componente específico para rutas de solo administradores (mantener compatibilidad)
export const AdminRoute = ({ children }) => {
    return <ProtectedRoute adminOnly={true}>{children}</ProtectedRoute>
}