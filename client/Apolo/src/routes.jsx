import { Navigate } from 'react-router'
import Layout from './components/Layout'
import ErrorPage from './pages/ErrorPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CustomersPage from './pages/customers/CustomersPage'
import ProductsPage from './pages/products/ProductsPage'
import UsersPage from './pages/users/UsersPage'
import SalesPage from './pages/sales/SalesPage'
import POSPage from './pages/pos/POSPage'
import SuppliersPage from './pages/suppliers/SuppliersPage'
import SalesReportPage from './pages/reports/SalesReportPage'
import SettingsPage from './pages/settings/SettingsPage'
import HelpPage from './pages/help/HelpPage'
import { ProtectedRoute } from './pages/ProtectedRoute'

const routes = [
    {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            // Rutas para usuarios normales y administradores
            {
                path: 'pos',
                element: <ProtectedRoute><POSPage /></ProtectedRoute>,
            },
            {
                path: 'customers',
                element: <ProtectedRoute><CustomersPage /></ProtectedRoute>,
            },
            {
                path: 'help',
                element: <ProtectedRoute><HelpPage /></ProtectedRoute>,
            },
            // Rutas SOLO para administradores
            {
                path: 'dashboard',
                element: <ProtectedRoute adminOnly={true}><DashboardPage /></ProtectedRoute>,
            },
            {
                path: 'products',
                element: <ProtectedRoute adminOnly={true}><ProductsPage /></ProtectedRoute>,
            },
            {
                path: 'suppliers',
                element: <ProtectedRoute adminOnly={true}><SuppliersPage /></ProtectedRoute>,
            },
            {
                path: 'sales',
                element: <ProtectedRoute adminOnly={true}><SalesPage /></ProtectedRoute>,
            },
            {
                path: 'reports/sales',
                element: <ProtectedRoute adminOnly={true}><SalesReportPage /></ProtectedRoute>,
            },
            {
                path: 'settings',
                element: <ProtectedRoute adminOnly={true}><SettingsPage /></ProtectedRoute>,
            },
            {
                path: 'users',
                element: <ProtectedRoute adminOnly={true}><UsersPage /></ProtectedRoute>,
            },
            {
                path: '*',
                element: <Navigate to="/" replace />,
            },
        ],
    },
]

export default routes   