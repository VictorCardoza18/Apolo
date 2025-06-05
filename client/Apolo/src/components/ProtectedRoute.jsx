import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()
    const location = useLocation()

    // Si está cargando, mostrar un spinner/loader
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Si está autenticado, mostrar el contenido protegido
    return children
}