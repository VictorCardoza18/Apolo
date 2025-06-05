import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'
import ProductModal from './ProductModal'
import * as productService from '../../service/productService'

const ProductsPage = () => {
    const { user } = useAuth()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [filterType, setFilterType] = useState('all') // all, low-stock
    const productsPerPage = 10

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const data = await productService.getProducts()
            setProducts(data)
        } catch (error) {
            console.error('Error al cargar productos:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los productos',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchLowStockProducts = async () => {
        try {
            setLoading(true)
            const data = await productService.getLowStockProducts()
            setProducts(data)
            setFilterType('low-stock')
        } catch (error) {
            console.error('Error al cargar productos con stock bajo:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los productos con stock bajo',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProduct = () => {
        setSelectedProduct(null)
        setIsModalOpen(true)
    }

    const handleEditProduct = (product) => {
        setSelectedProduct(product)
        setIsModalOpen(true)
    }

    const handleDeleteProduct = async (product) => {
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: `¿Estás seguro que deseas eliminar ${product.nombre_producto}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#27272a',
            color: '#ffffff'
        })

        if (result.isConfirmed) {
            try {
                await productService.deleteProduct(product._id)
                await fetchProducts()
                Swal.fire({
                    title: '¡Producto eliminado!',
                    text: 'El producto ha sido eliminado correctamente.',
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
                    text: 'No se pudo eliminar el producto',
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#ef4444',
                    confirmButtonColor: '#2563eb'
                })
            }
        }
    }

    const handleUpdateStock = async (product) => {
        const { value: newStock } = await Swal.fire({
            title: 'Actualizar Stock',
            text: `Stock actual de ${product.nombre_producto}: ${product.stock_actual}`,
            input: 'number',
            inputValue: product.stock_actual,
            inputAttributes: {
                min: 0,
                step: 1
            },
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            background: '#27272a',
            color: '#ffffff',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value || value < 0) {
                    return 'El stock debe ser mayor o igual a 0'
                }
            }
        })

        if (newStock !== undefined) {
            try {
                await productService.updateStock(product._id, { stock_actual: Number(newStock) })
                await fetchProducts()

                Swal.fire({
                    title: '¡Stock actualizado!',
                    text: 'El stock ha sido actualizado correctamente.',
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
                    text: 'No se pudo actualizar el stock',
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
        setSelectedProduct(null)
    }

    const handleModalSuccess = () => {
        fetchProducts()
        handleModalClose()
    }

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchProducts()
            return
        }

        try {
            setLoading(true)
            const data = await productService.searchProducts(searchTerm)
            setProducts(data)
            setCurrentPage(1)
            setFilterType('all')
        } catch (error) {
            console.error('Error en búsqueda:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setFilterType('all')
        fetchProducts()
        setCurrentPage(1)
    }

    const handleFilterChange = (type) => {
        if (type === 'low-stock') {
            fetchLowStockProducts()
        } else {
            setFilterType('all')
            fetchProducts()
        }
        setCurrentPage(1)
    }

    // Estadísticas
    const totalProducts = products.length
    const lowStockProducts = products.filter(p => p.stock_actual <= p.stock_minimo).length
    const totalValue = products.reduce((sum, product) => sum + (product.precio * product.stock_actual), 0)

    // Filtrar y paginar productos
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)
    const totalPages = Math.ceil(products.length / productsPerPage)

    const getStockStatus = (product) => {
        if (product.stock_actual === 0) {
            return { text: 'Sin stock', color: 'bg-red-100 text-red-800' }
        } else if (product.stock_actual <= product.stock_minimo) {
            return { text: 'Stock bajo', color: 'bg-yellow-100 text-yellow-800' }
        } else {
            return { text: 'En stock', color: 'bg-emerald-100 text-emerald-800' }
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-900">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-zinc-400">Cargando productos...</p>
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
                            <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Gestión de Productos</h1>
                            <p className="text-zinc-400">Administra tu inventario de productos</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateProduct}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Nuevo Producto</span>
                    </button>
                </div>

                {/* Búsqueda y filtros */}
                <div className="bg-zinc-800 rounded-xl p-6 mb-6 border border-zinc-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por código, nombre, descripción o categoría..."
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
                            <button
                                onClick={() => handleFilterChange('all')}
                                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${filterType === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => handleFilterChange('low-stock')}
                                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${filterType === 'low-stock'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                    }`}
                            >
                                Stock Bajo
                            </button>
                            <button
                                onClick={handleSearch}
                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <span>Buscar</span>
                            </button>

                            {searchTerm && (
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Total Productos</p>
                                <p className="text-2xl font-bold text-white">{totalProducts}</p>
                            </div>
                            <div className="bg-blue-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Stock Bajo</p>
                                <p className="text-2xl font-bold text-white">{lowStockProducts}</p>
                            </div>
                            <div className="bg-yellow-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Valor Total</p>
                                <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
                            </div>
                            <div className="bg-emerald-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Categorías</p>
                                <p className="text-2xl font-bold text-white">
                                    {new Set(products.filter(p => p.categoria_producto).map(p => p.categoria_producto)).size}
                                </p>
                            </div>
                            <div className="bg-purple-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de productos */}
                <div className="bg-zinc-800 rounded-xl shadow-lg border border-zinc-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-700">
                        <h2 className="text-lg font-semibold text-white">Lista de Productos</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Categoría</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Precio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-700">
                                {currentProducts.length > 0 ? (
                                    currentProducts.map((product) => {
                                        const stockStatus = getStockStatus(product)
                                        return (
                                            <tr key={product._id} className="hover:bg-zinc-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                    {product.codigo_producto}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-300">
                                                    <div>
                                                        <div className="font-medium">{product.nombre_producto}</div>
                                                        <div className="text-zinc-500 text-xs">{product.descripcion_producto?.substring(0, 50)}...</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                    {product.categoria_producto || 'Sin categoría'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                    ${product.precio?.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                    <div className="flex items-center space-x-2">
                                                        <span>{product.stock_actual}</span>
                                                        <span className="text-zinc-500">/ {product.stock_minimo} min</span>
                                                        <button
                                                            onClick={() => handleUpdateStock(product)}
                                                            className="text-blue-400 hover:text-blue-300 text-xs"
                                                            title="Actualizar stock"
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                                                        {stockStatus.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditProduct(product)}
                                                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                                            title="Editar producto"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                            </svg>
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteProduct(product)}
                                                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                                            title="Eliminar producto"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 01-1.414 1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-zinc-400">
                                            <div className="flex flex-col items-center space-y-3">
                                                <svg className="w-12 h-12 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-lg font-medium">No se encontraron productos</p>
                                                <p className="text-sm">
                                                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer producto'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {products.length > productsPerPage && (
                        <div className="px-6 py-3 border-t border-zinc-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-zinc-400">
                                    Mostrando {indexOfFirstProduct + 1} a {Math.min(indexOfLastProduct, products.length)} de {products.length} productos
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
                <ProductModal
                    product={selectedProduct}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    )
}

export default ProductsPage