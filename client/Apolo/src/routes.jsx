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
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'

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
            {
                path: 'dashboard',
                element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
            },
            {
                path: 'pos',
                element: <ProtectedRoute><POSPage /></ProtectedRoute>,
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
                path: 'suppliers',
                element: <ProtectedRoute><SuppliersPage /></ProtectedRoute>,
            },
            {
                path: 'sales',
                element: <ProtectedRoute><SalesPage /></ProtectedRoute>,
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