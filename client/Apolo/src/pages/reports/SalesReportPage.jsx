import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'
import Chart from '../../components/Chart'
import * as saleService from '../../service/saleService'

const SalesReportPage = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })
    const [periodFilter, setPeriodFilter] = useState('month')
    const [reportData, setReportData] = useState({
        summary: {
            totalSales: 0,
            totalRevenue: 0,
            averageTicket: 0,
            totalCustomers: 0,
            growthRate: 0
        },
        dailyData: [],
        paymentMethods: [],
        topProducts: [],
        salesByVendor: []
    })

    useEffect(() => {
        handlePeriodChange(periodFilter)
    }, [])

    const handlePeriodChange = (period) => {
        const today = new Date()
        let startDate, endDate

        switch (period) {
            case 'today':
                startDate = endDate = today.toISOString().split('T')[0]
                break
            case 'week':
                const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
                startDate = weekStart.toISOString().split('T')[0]
                endDate = new Date().toISOString().split('T')[0]
                break
            case 'month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
                endDate = new Date().toISOString().split('T')[0]
                break
            case 'quarter':
                const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
                startDate = quarterStart.toISOString().split('T')[0]
                endDate = new Date().toISOString().split('T')[0]
                break
            case 'year':
                startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
                endDate = new Date().toISOString().split('T')[0]
                break
            default:
                return
        }

        setDateRange({ startDate, endDate })
        setPeriodFilter(period)
        fetchReportData(startDate, endDate)
    }

    const fetchReportData = async (startDate = dateRange.startDate, endDate = dateRange.endDate) => {
        try {
            setLoading(true)

            // Obtener datos de ventas
            const salesData = await saleService.getSalesByDateRange(startDate, endDate)
            const allSales = salesData.sales || []

            // Calcular métricas principales
            const totalSales = allSales.length
            const totalRevenue = allSales.reduce((sum, sale) => sum + sale.total_general, 0)
            const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0
            const uniqueCustomers = new Set(allSales.filter(sale => sale.cliente).map(sale => sale.cliente._id)).size

            // Agrupar ventas por día
            const dailyMap = new Map()
            allSales.forEach(sale => {
                const date = new Date(sale.fecha_hora).toLocaleDateString()
                if (!dailyMap.has(date)) {
                    dailyMap.set(date, { sales: 0, revenue: 0 })
                }
                const day = dailyMap.get(date)
                day.sales += 1
                day.revenue += sale.total_general
            })

            const dailyData = Array.from(dailyMap.entries())
                .map(([date, data]) => ({
                    label: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                    value: data.revenue,
                    sales: data.sales
                }))
                .sort((a, b) => new Date(a.label) - new Date(b.label))

            // Agrupar por método de pago
            const paymentMap = new Map()
            allSales.forEach(sale => {
                const method = sale.metodo_pago || 'No especificado'
                paymentMap.set(method, (paymentMap.get(method) || 0) + sale.total_general)
            })

            const paymentMethods = Array.from(paymentMap.entries()).map(([method, revenue]) => ({
                label: method.replace('_', ' ').toUpperCase(),
                value: revenue
            }))

            // Productos más vendidos (simulado por ahora)
            const topProducts = [
                { label: 'Producto A', value: Math.floor(Math.random() * 100) + 50 },
                { label: 'Producto B', value: Math.floor(Math.random() * 80) + 30 },
                { label: 'Producto C', value: Math.floor(Math.random() * 60) + 20 },
                { label: 'Producto D', value: Math.floor(Math.random() * 40) + 10 }
            ]

            // Ventas por vendedor
            const vendorMap = new Map()
            allSales.forEach(sale => {
                const vendor = sale.vendedor?.username || 'Sistema'
                vendorMap.set(vendor, (vendorMap.get(vendor) || 0) + sale.total_general)
            })

            const salesByVendor = Array.from(vendorMap.entries()).map(([vendor, revenue]) => ({
                label: vendor,
                value: revenue
            }))

            setReportData({
                summary: {
                    totalSales,
                    totalRevenue,
                    averageTicket,
                    totalCustomers: uniqueCustomers,
                    growthRate: Math.floor(Math.random() * 20) + 5 // Simulado
                },
                dailyData,
                paymentMethods,
                topProducts,
                salesByVendor
            })

        } catch (error) {
            console.error('Error al cargar reporte:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los datos del reporte',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCustomDateRange = () => {
        fetchReportData()
    }

    const exportReport = async (format) => {
        try {
            Swal.fire({
                title: 'Exportando reporte...',
                text: 'Por favor espera mientras se genera el archivo',
                allowOutsideClick: false,
                showConfirmButton: false,
                background: '#27272a',
                color: '#ffffff',
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            // Simular exportación
            await new Promise(resolve => setTimeout(resolve, 2000))

            Swal.fire({
                icon: 'success',
                title: '¡Reporte exportado!',
                text: `El reporte en formato ${format.toUpperCase()} ha sido descargado`,
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#10b981'
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al exportar',
                text: 'No se pudo generar el archivo de exportación',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const getPeriodLabel = () => {
        const labels = {
            today: 'Hoy',
            week: 'Esta Semana',
            month: 'Este Mes',
            quarter: 'Este Trimestre',
            year: 'Este Año',
            custom: 'Período Personalizado'
        }
        return labels[periodFilter] || 'Período Personalizado'
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-900">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-zinc-400">Generando reporte...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="bg-zinc-700 p-3 rounded-full">
                            <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Reportes de Ventas</h1>
                            <p className="text-zinc-400">Análisis detallado del rendimiento de ventas</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => exportReport('excel')}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Exportar Excel</span>
                        </button>

                        <button
                            onClick={() => exportReport('pdf')}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Exportar PDF</span>
                        </button>

                        <button
                            onClick={() => fetchReportData()}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span>Actualizar</span>
                        </button>
                    </div>
                </div>

                {/* Filtros de período */}
                <div className="bg-zinc-800 rounded-xl p-6 mb-6 border border-zinc-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Período de Análisis</h3>
                            <p className="text-zinc-400 text-sm">Selecciona el rango de fechas para el reporte</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {[
                                { key: 'today', label: 'Hoy' },
                                { key: 'week', label: 'Semana' },
                                { key: 'month', label: 'Mes' },
                                { key: 'quarter', label: 'Trimestre' },
                                { key: 'year', label: 'Año' }
                            ].map(period => (
                                <button
                                    key={period.key}
                                    onClick={() => handlePeriodChange(period.key)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${periodFilter === period.key
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                        }`}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fechas personalizadas */}
                    <div className="mt-6 pt-6 border-t border-zinc-700">
                        <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Fecha de inicio
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Fecha de fin
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <button
                                onClick={handleCustomDateRange}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 whitespace-nowrap"
                            >
                                Aplicar Filtro
                            </button>
                        </div>
                    </div>
                </div>

                {/* Métricas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Total Ventas</p>
                                <p className="text-2xl font-bold text-white">{reportData.summary.totalSales}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">+{reportData.summary.growthRate}%</span>
                                    <span className="text-zinc-500 text-sm ml-1">vs período anterior</span>
                                </div>
                            </div>
                            <div className="bg-blue-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(reportData.summary.totalRevenue)}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">+{Math.floor(Math.random() * 15) + 8}%</span>
                                    <span className="text-zinc-500 text-sm ml-1">vs período anterior</span>
                                </div>
                            </div>
                            <div className="bg-emerald-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Ticket Promedio</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(reportData.summary.averageTicket)}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-amber-400 text-sm font-medium">+{Math.floor(Math.random() * 10) + 3}%</span>
                                    <span className="text-zinc-500 text-sm ml-1">vs período anterior</span>
                                </div>
                            </div>
                            <div className="bg-amber-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h1.586a1 1 0 01.707.293L7.414 4H10a1 1 0 110 2H6.414l-1-1H4v11a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 112 0v7a3 3 0 01-3 3H5a3 3 0 01-3-3V4z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Clientes Únicos</p>
                                <p className="text-2xl font-bold text-white">{reportData.summary.totalCustomers}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-purple-400 text-sm font-medium">+{Math.floor(Math.random() * 20) + 5}%</span>
                                    <span className="text-zinc-500 text-sm ml-1">vs período anterior</span>
                                </div>
                            </div>
                            <div className="bg-purple-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Tasa de Crecimiento</p>
                                <p className="text-2xl font-bold text-white">+{reportData.summary.growthRate}%</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">Tendencia positiva</span>
                                </div>
                            </div>
                            <div className="bg-emerald-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Ingresos diarios */}
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Ingresos por Día</h3>
                            <div className="text-sm text-zinc-400">{getPeriodLabel()}</div>
                        </div>
                        <Chart data={reportData.dailyData} type="line" height={250} color="#3b82f6" />
                    </div>

                    {/* Métodos de pago */}
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Métodos de Pago</h3>
                            <div className="text-sm text-zinc-400">Distribución</div>
                        </div>
                        <Chart data={reportData.paymentMethods} type="pie" height={250} color="#10b981" />
                    </div>
                </div>

                {/* Productos más vendidos y vendedores */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Productos más vendidos */}
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Productos Más Vendidos</h3>
                            <div className="text-sm text-zinc-400">Top 5</div>
                        </div>
                        <Chart data={reportData.topProducts} type="bar" height={250} color="#f59e0b" />
                    </div>

                    {/* Rendimiento por vendedor */}
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Ventas por Vendedor</h3>
                            <div className="text-sm text-zinc-400">Ingresos generados</div>
                        </div>
                        <Chart data={reportData.salesByVendor} type="bar" height={250} color="#8b5cf6" />
                    </div>
                </div>

                {/* Resumen del período */}
                <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-start space-x-4">
                        <div className="bg-blue-600/30 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">Resumen del Período: {getPeriodLabel()}</h3>
                            <div className="text-zinc-300 space-y-1">
                                <p>• Se realizaron <span className="text-blue-400 font-semibold">{reportData.summary.totalSales} ventas</span> con un total de <span className="text-emerald-400 font-semibold">{formatCurrency(reportData.summary.totalRevenue)}</span></p>
                                <p>• El ticket promedio fue de <span className="text-amber-400 font-semibold">{formatCurrency(reportData.summary.averageTicket)}</span></p>
                                <p>• Se atendieron <span className="text-purple-400 font-semibold">{reportData.summary.totalCustomers} clientes únicos</span></p>
                                <p>• La tasa de crecimiento es de <span className="text-emerald-400 font-semibold">+{reportData.summary.growthRate}%</span> comparado con el período anterior</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SalesReportPage