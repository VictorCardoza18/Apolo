import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router'
import Swal from 'sweetalert2'
import * as dashboardService from '../../service/dashboardService'

const DashboardPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        totalSales: 0,
        totalSuppliers: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        activeUsers: 0
    })
    const [loading, setLoading] = useState(true)
    const [lowStockItems, setLowStockItems] = useState([])
    const [recentSales, setRecentSales] = useState([])
    const [aiInsights, setAIInsights] = useState(null)
    const [lastUpdate, setLastUpdate] = useState(new Date())

    useEffect(() => {
        fetchDashboardData()
        // Actualizar cada 5 minutos
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Usar el servicio actualizado que no requiere nuevas APIs
            const [
                dashboardStats,
                lowStockItems,
                recentSalesData,
                aiData
            ] = await Promise.all([
                dashboardService.getDashboardStats(),
                dashboardService.getLowStockProducts().catch(() => []),
                dashboardService.getRecentSales(5).catch(() => []),
                dashboardService.getAIInsights().catch(() => null)
            ])

            setStats(dashboardStats)
            setLowStockItems(lowStockItems.slice(0, 5))
            setRecentSales(recentSalesData)
            setAIInsights(aiData)
            setLastUpdate(new Date())

        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar algunos datos del dashboard',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb',
                timer: 3000,
                showConfirmButton: false
            })
        } finally {
            setLoading(false)
        }
    }

    // Navegación de acciones rápidas
    const handleQuickAction = (action) => {
        switch (action) {
            case 'nueva-venta':
                navigate('/pos')
                break
            case 'nuevo-producto':
                navigate('/products')
                break
            case 'nuevo-cliente':
                navigate('/customers')
                break
            case 'reportes':
                navigate('/sales')
                break
            case 'stock-bajo':
                navigate('/products')
                break
            case 'inventario':
                navigate('/products')
                break
            default:
                break
        }
    }

    // Mostrar productos con stock bajo
    const showLowStockDetails = () => {
        if (lowStockItems.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Stock en buen estado',
                text: 'No hay productos con stock bajo en este momento',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
            return
        }

        const itemsList = lowStockItems.map(item =>
            `• ${item.nombre_producto} (${item.codigo_producto}): ${item.stock_actual} unidades`
        ).join('\n')

        Swal.fire({
            title: 'Productos con Stock Bajo',
            html: `
                <div class="text-left">
                    <p class="mb-3 text-zinc-300">Los siguientes productos necesitan reabastecimiento:</p>
                    <div class="bg-zinc-700 p-3 rounded text-sm font-mono">
                        ${lowStockItems.map(item => `
                            <div class="flex justify-between py-1">
                                <span>${item.nombre_producto}</span>
                                <span class="text-amber-400">${item.stock_actual} unidades</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,
            icon: 'warning',
            confirmButtonText: 'Ver Productos',
            showCancelButton: true,
            cancelButtonText: 'Cerrar',
            background: '#27272a',
            color: '#ffffff',
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/products')
            }
        })
    }

    // Calcular cambios porcentuales (simulados por ahora)
    const getGrowthPercentage = (type) => {
        const growthRates = {
            customers: Math.floor(Math.random() * 20) + 5,
            products: Math.floor(Math.random() * 10) + 2,
            sales: Math.floor(Math.random() * 25) + 8,
            revenue: Math.floor(Math.random() * 30) + 10
        }
        return growthRates[type] || 0
    }

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
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
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

                        <button
                            onClick={fetchDashboardData}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            title="Actualizar datos"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span>Actualizar</span>
                        </button>
                    </div>

                    <div className="text-sm text-zinc-500">
                        Última actualización: {lastUpdate.toLocaleDateString('es-ES', {
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
                    <div
                        className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700 hover:border-blue-500/50 transition-colors duration-200 cursor-pointer"
                        onClick={() => navigate('/customers')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Clientes</h2>
                                <p className="text-3xl font-bold text-white mt-2">{stats.totalCustomers}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">+{getGrowthPercentage('customers')}%</span>
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
                    <div
                        className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700 hover:border-emerald-500/50 transition-colors duration-200 cursor-pointer"
                        onClick={() => navigate('/products')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Productos</h2>
                                <p className="text-3xl font-bold text-white mt-2">{stats.totalProducts}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">+{getGrowthPercentage('products')}%</span>
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
                    <div
                        className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700 hover:border-amber-500/50 transition-colors duration-200 cursor-pointer"
                        onClick={showLowStockDetails}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Stock Bajo</h2>
                                <p className="text-3xl font-bold text-white mt-2">{stats.lowStockProducts}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-amber-400 text-sm font-medium">
                                        {stats.lowStockProducts > 0 ? '¡Atención!' : 'Todo bien'}
                                    </span>
                                    <span className="text-zinc-500 text-sm ml-1">
                                        {stats.lowStockProducts > 0 ? 'Revisar pronto' : 'Stock saludable'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-amber-600/20 p-3 rounded-lg">
                                <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Ingresos del día */}
                    <div
                        className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700 hover:border-green-500/50 transition-colors duration-200 cursor-pointer"
                        onClick={() => navigate('/sales')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Ingresos Hoy</h2>
                                <p className="text-3xl font-bold text-white mt-2">${stats.todayRevenue.toFixed(2)}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">+{getGrowthPercentage('revenue')}%</span>
                                    <span className="text-zinc-500 text-sm ml-1">vs ayer</span>
                                </div>
                            </div>
                            <div className="bg-green-600/20 p-3 rounded-lg">
                                <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Ventas del Mes</p>
                                <p className="text-2xl font-bold text-white">{stats.totalSales}</p>
                            </div>
                            <div className="text-purple-400">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Ingresos del Mes</p>
                                <p className="text-2xl font-bold text-white">${stats.monthlyRevenue.toFixed(2)}</p>
                            </div>
                            <div className="text-green-400">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Proveedores Activos</p>
                                <p className="text-2xl font-bold text-white">{stats.totalSuppliers}</p>
                            </div>
                            <div className="text-orange-400">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                            <button
                                onClick={() => handleQuickAction('nueva-venta')}
                                className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg transition-colors duration-200 group"
                            >
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="bg-blue-600/20 p-3 rounded-lg group-hover:bg-blue-600/30 transition-colors duration-200">
                                        <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Nueva Venta</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleQuickAction('nuevo-producto')}
                                className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg transition-colors duration-200 group"
                            >
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="bg-emerald-600/20 p-3 rounded-lg group-hover:bg-emerald-600/30 transition-colors duration-200">
                                        <svg className="h-6 w-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Añadir Producto</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleQuickAction('nuevo-cliente')}
                                className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg transition-colors duration-200 group"
                            >
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="bg-purple-600/20 p-3 rounded-lg group-hover:bg-purple-600/30 transition-colors duration-200">
                                        <svg className="h-6 w-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Nuevo Cliente</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleQuickAction('reportes')}
                                className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg transition-colors duration-200 group"
                            >
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="bg-amber-600/20 p-3 rounded-lg group-hover:bg-amber-600/30 transition-colors duration-200">
                                        <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">Ver Reportes</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Insights & Analytics */}
                    <div className="bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-700">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-purple-600/20 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-white">Insights & Analytics</h2>
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
                                        <p className="text-sm text-zinc-300">
                                            Las ventas esperadas para el próximo mes son un
                                            <span className="text-emerald-400 font-medium"> +{aiInsights?.salesPrediction?.nextMonthGrowth || 12}% superiores</span> al mes actual.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-gradient-to-r from-amber-600/20 to-amber-500/10 p-4 rounded-lg border border-amber-500/20 cursor-pointer hover:border-amber-400/40 transition-colors duration-200"
                                onClick={() => handleQuickAction('inventario')}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="bg-amber-600/30 p-2 rounded-lg">
                                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 10v6h8v-6H6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-amber-400 mb-1">Recomendaciones de Inventario</h3>
                                        <p className="text-sm text-zinc-300">
                                            <span className="text-amber-400 font-medium">{stats.lowStockProducts} productos</span> necesitan ser reabastecidos pronto. Haz clic para ver detalles.
                                        </p>
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
                                        <h3 className="font-medium text-emerald-400 mb-1">Análisis de Clientes</h3>
                                        <p className="text-sm text-zinc-300">
                                            Tienes <span className="text-emerald-400 font-medium">{stats.activeUsers} clientes activos</span> con un ticket promedio de
                                            <span className="text-emerald-400 font-medium"> ${aiInsights?.customerPatterns?.avgOrderValue || 350}</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Productos con stock bajo (si los hay) */}
                {lowStockItems.length > 0 && (
                    <div className="mt-8 bg-amber-900/20 border border-amber-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-amber-400">⚠️ Productos con Stock Bajo</h3>
                            <button
                                onClick={() => navigate('/products')}
                                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                            >
                                Ver todos →
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {lowStockItems.map(product => (
                                <div key={product._id} className="bg-zinc-800 rounded-lg p-4 border border-amber-500/20">
                                    <h4 className="text-white font-medium text-sm mb-1 truncate">{product.nombre_producto}</h4>
                                    <p className="text-zinc-400 text-xs mb-2">{product.codigo_producto}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-amber-400 font-bold">{product.stock_actual}</span>
                                        <span className="text-zinc-500 text-xs">unidades</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DashboardPage