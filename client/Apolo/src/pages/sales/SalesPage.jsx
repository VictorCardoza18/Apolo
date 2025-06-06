import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'
import SaleModal from './SaleModal'
import * as saleService from '../../service/saleService'

const SalesPage = () => {
    const { user } = useAuth()
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSale, setSelectedSale] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterPayment, setFilterPayment] = useState('all')
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    })
    const salesPerPage = 10

    useEffect(() => {
        fetchSales()
    }, [])

    const fetchSales = async () => {
        try {
            setLoading(true)
            const data = await saleService.getSales()
            setSales(data)
        } catch (error) {
            console.error('Error al cargar ventas:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las ventas',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateSale = () => {
        setSelectedSale(null)
        setIsModalOpen(true)
    }

    const handleViewSale = (sale) => {
        setSelectedSale(sale)
        setIsModalOpen(true)
    }

    const handleStatusChange = async (sale, newStatus) => {
        const result = await Swal.fire({
            title: '¿Cambiar estado?',
            text: `¿Estás seguro que deseas cambiar el estado de la venta a "${newStatus}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'cancelada' ? '#ef4444' : '#2563eb',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar',
            background: '#27272a',
            color: '#ffffff'
        })

        if (result.isConfirmed) {
            try {
                await saleService.updateSaleStatus(sale._id, { estado_venta: newStatus })
                await fetchSales()
                Swal.fire({
                    title: '¡Estado actualizado!',
                    text: 'El estado de la venta ha sido actualizado correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#10b981'
                })
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'No se pudo actualizar el estado',
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#ef4444',
                    confirmButtonColor: '#2563eb'
                })
            }
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setSelectedSale(null)
    }

    const handleModalSuccess = () => {
        fetchSales()
        handleModalClose()
    }

    const handleSearch = () => {
        setCurrentPage(1)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setFilterStatus('all')
        setFilterPayment('all')
        setDateRange({ startDate: '', endDate: '' })
        setCurrentPage(1)
    }

    const handleDateFilter = async () => {
        if (!dateRange.startDate || !dateRange.endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Fechas requeridas',
                text: 'Selecciona un rango de fechas válido',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
            return
        }

        try {
            setLoading(true)
            const data = await saleService.getSalesByDateRange(dateRange.startDate, dateRange.endDate)
            setSales(data.sales)

            if (data.stats) {
                Swal.fire({
                    title: 'Estadísticas del período',
                    html: `
                        <div class="text-left">
                            <p><strong>Total de ventas:</strong> ${data.stats.totalVentas}</p>
                            <p><strong>Ingresos totales:</strong> $${data.stats.totalIngresos.toFixed(2)}</p>
                        </div>
                    `,
                    icon: 'info',
                    background: '#27272a',
                    color: '#ffffff',
                    confirmButtonColor: '#2563eb'
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las ventas del período',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    // Filtrar ventas
    const filteredSales = sales.filter(sale => {
        const matchesSearch = sale.codigo_venta.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.vendedor?.username?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || sale.estado_venta === filterStatus
        const matchesPayment = filterPayment === 'all' || sale.metodo_pago === filterPayment
        return matchesSearch && matchesStatus && matchesPayment
    })

    // Estadísticas
    const totalSales = sales.length
    const completedSales = sales.filter(s => s.estado_venta === 'completada').length
    const cancelledSales = sales.filter(s => s.estado_venta === 'cancelada').length
    const totalRevenue = sales
        .filter(s => s.estado_venta === 'completada')
        .reduce((total, sale) => total + sale.total_general, 0)

    // Paginar ventas filtradas
    const indexOfLastSale = currentPage * salesPerPage
    const indexOfFirstSale = indexOfLastSale - salesPerPage
    const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale)
    const totalPages = Math.ceil(filteredSales.length / salesPerPage)

    const getStatusColor = (status) => {
        switch (status) {
            case 'completada':
                return 'bg-emerald-100 text-emerald-800'
            case 'cancelada':
                return 'bg-red-100 text-red-800'
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentMethodLabel = (method) => {
        const methods = {
            'efectivo': 'Efectivo',
            'tarjeta_credito': 'Tarjeta de Crédito',
            'tarjeta_debito': 'Tarjeta de Débito',
            'transferencia': 'Transferencia'
        }
        return methods[method] || method
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-900">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-zinc-400">Cargando ventas...</p>
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
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Gestión de Ventas</h1>
                            <p className="text-zinc-400">Administra las ventas del sistema</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateSale}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Nueva Venta</span>
                    </button>
                </div>

                {/* Búsqueda y filtros */}
                <div className="bg-zinc-800 rounded-xl p-6 mb-6 border border-zinc-700">
                    <div className="space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar por código, cliente o vendedor..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full bg-zinc-700 text-white px-4 py-3 pl-10 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <svg className="w-5 h-5 text-zinc-400 absolute left-3 top-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="completada">Completadas</option>
                                    <option value="pendiente">Pendientes</option>
                                    <option value="cancelada">Canceladas</option>
                                </select>

                                <select
                                    value={filterPayment}
                                    onChange={(e) => setFilterPayment(e.target.value)}
                                    className="bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="all">Todos los métodos</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="tarjeta_credito">Tarjeta de Crédito</option>
                                    <option value="tarjeta_debito">Tarjeta de Débito</option>
                                    <option value="transferencia">Transferencia</option>
                                </select>

                                <button
                                    onClick={handleSearch}
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                    <span>Buscar</span>
                                </button>

                                {(searchTerm || filterStatus !== 'all' || filterPayment !== 'all') && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="flex items-center space-x-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <span>Limpiar</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filtro por fecha */}
                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-700">
                            <span className="text-zinc-300 text-sm font-medium">Filtrar por fecha:</span>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="bg-zinc-700 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                            />
                            <span className="text-zinc-400">hasta</span>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="bg-zinc-700 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={handleDateFilter}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                Filtrar
                            </button>
                            <button
                                onClick={fetchSales}
                                className="bg-zinc-600 hover:bg-zinc-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                Ver todas
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Total Ventas</p>
                                <p className="text-2xl font-bold text-white">{totalSales}</p>
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
                                <p className="text-zinc-400 text-sm">Completadas</p>
                                <p className="text-2xl font-bold text-white">{completedSales}</p>
                            </div>
                            <div className="bg-emerald-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Canceladas</p>
                                <p className="text-2xl font-bold text-white">{cancelledSales}</p>
                            </div>
                            <div className="bg-red-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 01-1.414 1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="bg-green-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de ventas */}
                <div className="bg-zinc-800 rounded-xl shadow-lg border border-zinc-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-700">
                        <h2 className="text-lg font-semibold text-white">Lista de Ventas</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Vendedor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Método Pago</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-700">
                                {currentSales.length > 0 ? (
                                    currentSales.map((sale) => (
                                        <tr key={sale._id} className="hover:bg-zinc-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                {sale.codigo_venta}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {sale.cliente ?
                                                    `${sale.cliente.nombre} ${sale.cliente.apellidoP}` :
                                                    'Sin cliente'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {sale.vendedor?.username || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                                                ${sale.total_general.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {getPaymentMethodLabel(sale.metodo_pago)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.estado_venta)}`}>
                                                    {sale.estado_venta}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {formatDate(sale.fecha_hora)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewSale(sale)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                                        title="Ver detalles"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>

                                                    {sale.estado_venta === 'pendiente' && (
                                                        <button
                                                            onClick={() => handleStatusChange(sale, 'completada')}
                                                            className="text-green-400 hover:text-green-300 transition-colors duration-200"
                                                            title="Completar venta"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {(sale.estado_venta === 'completada' || sale.estado_venta === 'pendiente') && (
                                                        <button
                                                            onClick={() => handleStatusChange(sale, 'cancelada')}
                                                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                                            title="Cancelar venta"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 01-1.414 1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-zinc-400">
                                            <div className="flex flex-col items-center space-y-3">
                                                <svg className="w-12 h-12 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-lg font-medium">No se encontraron ventas</p>
                                                <p className="text-sm">
                                                    {searchTerm || filterStatus !== 'all' || filterPayment !== 'all' ? 'Intenta con otros términos de búsqueda' : 'Comienza registrando tu primera venta'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {filteredSales.length > salesPerPage && (
                        <div className="px-6 py-3 border-t border-zinc-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-zinc-400">
                                    Mostrando {indexOfFirstSale + 1} a {Math.min(indexOfLastSale, filteredSales.length)} de {filteredSales.length} ventas
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm bg-zinc-700 text-white rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>

                                    <span className="px-3 py-1 text-sm text-zinc-400">
                                        Página {currentPage} de {totalPages}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm bg-zinc-700 text-white rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <SaleModal
                    sale={selectedSale}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    )
}

export default SalesPage