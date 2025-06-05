import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router'

export const AdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth()

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />
    }

    return children
}