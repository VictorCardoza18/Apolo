import { Navigate } from 'react-router'
import Layout from './components/Layout'
import ErrorPage from './pages/ErrorPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CustomersPage from './pages/customers/CustomersPage'
import ProductsPage from './pages/products/ProductsPage'
import UsersPage from './pages/users/UsersPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'

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
                path: 'dashboard',
                element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
            },
            {
                path: 'customers',
                element: <ProtectedRoute><CustomersPage /></ProtectedRoute>,
            },
            {
                path: 'products',
                element: <ProtectedRoute><ProductsPage /></ProtectedRoute>,
            },
            {
                path: 'users',
                element: <AdminRoute><UsersPage /></AdminRoute>,
            },
            {
                path: '*',
                element: <Navigate to="/" replace />,
            },
        ],
    },
]

export default routes