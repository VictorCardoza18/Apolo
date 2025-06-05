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
                    text: 'No se pudieron cargar los datos del dashboard',
                    background: '#27272a',
                    color: '#ffffff'
                })
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-900">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-zinc-400">Cargando dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-zinc-700 p-3 rounded-full">
                            <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                            <p className="text-zinc-400">Bienvenido de vuelta, <span className="text-blue-400 font-medium">{user?.username}</span></p>
                        </div>
                    </div>
                    <div className="text-sm text-zinc-500">
                        Última actualización: {new Date().toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Clientes */}
                    <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700 hover:border-blue-500/50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Clientes</h2>
                                <p className="text-3xl font-bold text-white mt-2">{stats.totalCustomers}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">+12%</span>
                                    <span className="text-zinc-500 text-sm ml-1">vs mes anterior</span>
                                </div>
                            </div>
                            <div className="bg-blue-600/20 p-3 rounded-lg">
                                <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Productos */}
                    <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700 hover:border-emerald-500/50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Productos</h2>
                                <p className="text-3xl font-bold text-white mt-2">{stats.totalProducts}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">+5%</span>
                                    <span className="text-zinc-500 text-sm ml-1">vs mes anterior</span>
                                </div>
                            </div>
                            <div className="bg-emerald-600/20 p-3 rounded-lg">
                                <svg className="h-6 w-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 10v6h8v-6H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Stock Bajo */}
                    <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700 hover:border-amber-500/50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Stock Bajo</h2>
                                <p className="text-3xl font-bold text-white mt-2">{stats.lowStockProducts}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-amber-400 text-sm font-medium">¡Atención!</span>
                                    <span className="text-zinc-500 text-sm ml-1">Revisar pronto</span>
                                </div>
                            </div>
                            <div className="bg-amber-600/20 p-3 rounded-lg">
                                <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Ventas */}
                    <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700 hover:border-purple-500/50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Total Ventas</h2>
                                <p className="text-3xl font-bold text-white mt-2">{stats.totalSales}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">+18%</span>
                                    <span className="text-zinc-500 text-sm ml-1">vs mes anterior</span>
                                </div>
                            </div>
                            <div className="bg-purple-600/20 p-3 rounded-lg">
                                <svg className="h-6 w-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Acciones Rápidas */}
                    <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-blue-600/20 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-white">Acciones Rápidas</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg transition-colors duration-200 group">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="bg-blue-600/20 p-3 rounded-lg group-hover:bg-blue-600/30 transition-colors duration-200">
                                        <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Nueva Venta</span>
                                </div>
                            </button>

                            <button className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg transition-colors duration-200 group">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="bg-emerald-600/20 p-3 rounded-lg group-hover:bg-emerald-600/30 transition-colors duration-200">
                                        <svg className="h-6 w-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Añadir Producto</span>
                                </div>
                            </button>

                            <button className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg transition-colors duration-200 group">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="bg-purple-600/20 p-3 rounded-lg group-hover:bg-purple-600/30 transition-colors duration-200">
                                        <svg className="h-6 w-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Nuevo Cliente</span>
                                </div>
                            </button>

                            <button className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg transition-colors duration-200 group">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="bg-amber-600/20 p-3 rounded-lg group-hover:bg-amber-600/30 transition-colors duration-200">
                                        <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Reportes</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* IA & Analytics */}
                    <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-purple-600/20 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-white">IA & Analytics</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-blue-600/30 p-2 rounded-lg">
                                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-blue-400 mb-1">Predicción de Ventas</h3>
                                        <p className="text-sm text-zinc-300">Las ventas esperadas para el próximo mes son un <span className="text-emerald-400 font-medium">12% superiores</span> al mes actual.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-amber-600/30 p-2 rounded-lg">
                                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 10v6h8v-6H6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-amber-400 mb-1">Recomendaciones de Inventario</h3>
                                        <p className="text-sm text-zinc-300"><span className="text-amber-400 font-medium">5 productos</span> necesitan ser reabastecidos pronto. Haz clic para ver detalles.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-emerald-600/30 p-2 rounded-lg">
                                        <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-emerald-400 mb-1">Patrones de Clientes</h3>
                                        <p className="text-sm text-zinc-300">Descubre los hábitos de compra de tus clientes frecuentes para <span className="text-emerald-400 font-medium">personalizar ofertas</span>.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage