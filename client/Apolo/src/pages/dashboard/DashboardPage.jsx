import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'

const DashboardPage = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        totalSales: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // En una aplicación real, estos datos vendrían de tu API
                // Aquí simulamos la obtención de datos
                setStats({
                    totalCustomers: 25,
                    totalProducts: 150,
                    lowStockProducts: 8,
                    totalSales: 523
                })
                setLoading(false)
            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los datos del dashboard'
                })
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Bienvenido, {user.username}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <h2 className="text-sm font-medium text-gray-500">Clientes</h2>
                            <p className="text-3xl font-bold text-gray-800">{stats.totalCustomers}</p>
                        </div>
                        <div className="bg-primary-100 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <h2 className="text-sm font-medium text-gray-500">Productos</h2>
                            <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <h2 className="text-sm font-medium text-gray-500">Stock bajo</h2>
                            <p className="text-3xl font-bold text-gray-800">{stats.lowStockProducts}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <h2 className="text-sm font-medium text-gray-500">Total ventas</h2>
                            <p className="text-3xl font-bold text-gray-800">{stats.totalSales}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones rápidas</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-primary-50 hover:bg-primary-100 text-primary-700 p-4 rounded-lg flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Nueva venta</span>
                        </button>
                        <button className="bg-primary-50 hover:bg-primary-100 text-primary-700 p-4 rounded-lg flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Añadir producto</span>
                        </button>
                        <button className="bg-primary-50 hover:bg-primary-100 text-primary-700 p-4 rounded-lg flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Nuevo cliente</span>
                        </button>
                        <button className="bg-primary-50 hover:bg-primary-100 text-primary-700 p-4 rounded-lg flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Reportes</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">IA & Analytics</h2>
                    <div className="space-y-4">
                        <div className="bg-primary-50 p-4 rounded-lg">
                            <h3 className="font-medium text-primary-700">Predicción de ventas</h3>
                            <p className="text-sm text-gray-600">Las ventas esperadas para el próximo mes son un 12% superiores al mes actual.</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="font-medium text-yellow-700">Recomendaciones de inventario</h3>
                            <p className="text-sm text-gray-600">5 productos necesitan ser reabastecidos pronto. Haz clic para ver detalles.</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-green-700">Patrones de clientes</h3>
                            <p className="text-sm text-gray-600">Descubre los hábitos de compra de tus clientes frecuentes para personalizar ofertas.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage