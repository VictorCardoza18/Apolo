import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'
import SupplierModal from './SupplierModal'
import * as supplierService from '../../service/supplierService'

const SuppliersPage = () => {
    const { user } = useAuth()
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [filterStatus, setFilterStatus] = useState('all')
    const [showProductsModal, setShowProductsModal] = useState(false)
    const [supplierProducts, setSupplierProducts] = useState([])
    const suppliersPerPage = 10

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        try {
            setLoading(true)
            const data = await supplierService.getSuppliers()
            setSuppliers(data)
        } catch (error) {
            console.error('Error al cargar proveedores:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los proveedores',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateSupplier = () => {
        setSelectedSupplier(null)
        setIsModalOpen(true)
    }

    const handleEditSupplier = (supplier) => {
        setSelectedSupplier(supplier)
        setIsModalOpen(true)
    }

    const handleDeleteSupplier = async (supplier) => {
        const result = await Swal.fire({
            title: '¿Desactivar proveedor?',
            text: `¿Estás seguro que deseas desactivar a ${supplier.nombre_proveedor}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar',
            background: '#27272a',
            color: '#ffffff'
        })

        if (result.isConfirmed) {
            try {
                await supplierService.deleteSupplier(supplier._id)
                await fetchSuppliers()
                Swal.fire({
                    title: '¡Proveedor desactivado!',
                    text: 'El proveedor ha sido desactivado correctamente.',
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
                    text: 'No se pudo desactivar el proveedor',
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#ef4444',
                    confirmButtonColor: '#2563eb'
                })
            }
        }
    }

    const handleViewProducts = async (supplier) => {
        try {
            const products = await supplierService.getSupplierProducts(supplier._id)
            setSupplierProducts(products)
            setSelectedSupplier(supplier)
            setShowProductsModal(true)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los productos del proveedor',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setSelectedSupplier(null)
    }

    const handleModalSuccess = () => {
        fetchSuppliers()
        handleModalClose()
    }

    const handleSearch = async () => {
        if (searchTerm.trim()) {
            try {
                setLoading(true)
                const results = await supplierService.searchSuppliers(searchTerm)
                setSuppliers(results)
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error en búsqueda',
                    text: 'No se pudo realizar la búsqueda',
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#ef4444',
                    confirmButtonColor: '#2563eb'
                })
            } finally {
                setLoading(false)
            }
        } else {
            fetchSuppliers()
        }
        setCurrentPage(1)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setFilterStatus('all')
        setCurrentPage(1)
        fetchSuppliers()
    }

    // Filtrar proveedores
    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = supplier.nombre_proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.codigo_proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.correo_electronico?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && supplier.estado_proveedor) ||
            (filterStatus === 'inactive' && !supplier.estado_proveedor)
        return matchesSearch && matchesStatus
    })

    // Estadísticas
    const totalSuppliers = suppliers.length
    const activeSuppliers = suppliers.filter(s => s.estado_proveedor).length
    const inactiveSuppliers = suppliers.filter(s => !s.estado_proveedor).length

    // Paginar proveedores filtrados
    const indexOfLastSupplier = currentPage * suppliersPerPage
    const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage
    const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier)
    const totalPages = Math.ceil(filteredSuppliers.length / suppliersPerPage)

    const getStatusColor = (estado) => {
        return estado
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-red-100 text-red-800'
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-900">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-zinc-400">Cargando proveedores...</p>
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
                            <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Gestión de Proveedores</h1>
                            <p className="text-zinc-400">Administra los proveedores del sistema</p>
                        </div>
                    </div>

                    {(user?.role === 'admin' || user?.isAdmin) && (
                        <button
                            onClick={handleCreateSupplier}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span>Nuevo Proveedor</span>
                        </button>
                    )}
                </div>

                {/* Búsqueda y filtros */}
                <div className="bg-zinc-800 rounded-xl p-6 mb-6 border border-zinc-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, código o email..."
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
                                <option value="active">Activos</option>
                                <option value="inactive">Inactivos</option>
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

                            {(searchTerm || filterStatus !== 'all') && (
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
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Total Proveedores</p>
                                <p className="text-2xl font-bold text-white">{totalSuppliers}</p>
                            </div>
                            <div className="bg-blue-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Proveedores Activos</p>
                                <p className="text-2xl font-bold text-white">{activeSuppliers}</p>
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
                                <p className="text-zinc-400 text-sm">Proveedores Inactivos</p>
                                <p className="text-2xl font-bold text-white">{inactiveSuppliers}</p>
                            </div>
                            <div className="bg-red-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 01-1.414 1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de proveedores */}
                <div className="bg-zinc-800 rounded-xl shadow-lg border border-zinc-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-700">
                        <h2 className="text-lg font-semibold text-white">Lista de Proveedores</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Proveedor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Dirección</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Registro</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-700">
                                {currentSuppliers.length > 0 ? (
                                    currentSuppliers.map((supplier) => (
                                        <tr key={supplier._id} className="hover:bg-zinc-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-full ${supplier.estado_proveedor ? 'bg-zinc-700' : 'bg-red-700'}`}>
                                                        <svg className="w-5 h-5 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{supplier.nombre_proveedor}</div>
                                                        <div className="text-sm text-zinc-400">{supplier.codigo_proveedor}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-zinc-300">
                                                    {supplier.correo_electronico && (
                                                        <div className="mb-1">{supplier.correo_electronico}</div>
                                                    )}
                                                    {supplier.telefono && (
                                                        <div className="text-zinc-400">{supplier.telefono}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-zinc-300 max-w-xs truncate">
                                                    {supplier.direccion || 'No especificada'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.estado_proveedor)}`}>
                                                    {supplier.estado_proveedor ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {formatDate(supplier.fecha_registro || supplier.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewProducts(supplier)}
                                                        className="text-green-400 hover:text-green-300 transition-colors duration-200"
                                                        title="Ver productos"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>

                                                    {(user?.role === 'admin' || user?.isAdmin) && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditSupplier(supplier)}
                                                                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                                                title="Editar proveedor"
                                                            >
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </button>

                                                            {supplier.estado_proveedor && (
                                                                <button
                                                                    onClick={() => handleDeleteSupplier(supplier)}
                                                                    className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                                                    title="Desactivar proveedor"
                                                                >
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 01-1.414 1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-400">
                                            <div className="flex flex-col items-center space-y-3">
                                                <svg className="w-12 h-12 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-lg font-medium">No se encontraron proveedores</p>
                                                <p className="text-sm">
                                                    {searchTerm || filterStatus !== 'all' ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer proveedor'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {filteredSuppliers.length > suppliersPerPage && (
                        <div className="px-6 py-3 border-t border-zinc-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-zinc-400">
                                    Mostrando {indexOfFirstSupplier + 1} a {Math.min(indexOfLastSupplier, filteredSuppliers.length)} de {filteredSuppliers.length} proveedores
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

            {/* Modal de Proveedor */}
            {isModalOpen && (
                <SupplierModal
                    supplier={selectedSupplier}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* Modal de Productos del Proveedor */}
            {showProductsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                            <h2 className="text-xl font-semibold text-white">
                                Productos de {selectedSupplier?.nombre_proveedor}
                            </h2>
                            <button
                                onClick={() => setShowProductsModal(false)}
                                className="text-zinc-400 hover:text-white transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {supplierProducts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {supplierProducts.map(product => (
                                        <div key={product._id} className="bg-zinc-700 rounded-lg p-4 border border-zinc-600">
                                            <h3 className="text-white font-medium mb-2">{product.nombre_producto}</h3>
                                            <div className="space-y-1 text-sm">
                                                <p className="text-zinc-400">Código: {product.codigo_producto}</p>
                                                <p className="text-green-400">Precio: ${product.precio}</p>
                                                <p className="text-zinc-300">Stock: {product.stock_actual}</p>
                                                {product.categoria && (
                                                    <p className="text-zinc-400">Categoría: {product.categoria}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-zinc-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-zinc-400 text-lg">No hay productos registrados</p>
                                    <p className="text-zinc-500 text-sm">Este proveedor no tiene productos asociados</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SuppliersPage