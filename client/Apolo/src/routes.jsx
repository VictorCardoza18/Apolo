import { Navigate } from 'react-router'
import Layout from './components/Layout'
import ErrorPage from './pages/ErrorPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CustomersPage from './pages/customers/CustomersPage'
import { ProtectedRoute } from './components/ProtectedRoute'

// Definición de rutas usando React Router v7
const routes = [
    {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true, // Ruta raíz
                element: <HomePage />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'register',
                element: <RegisterPage />,
            },
            {
                path: 'dashboard',
                element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
            },
            {
                path: 'customers',
                element: <ProtectedRoute><CustomersPage /></ProtectedRoute>,
            },
            {
                path: '*',
                element: <Navigate to="/" replace />,
            },
        ],
    },
]

export default routes