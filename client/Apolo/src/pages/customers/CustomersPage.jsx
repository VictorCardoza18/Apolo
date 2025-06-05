import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'
import CustomerModal from '../customers/CustomerModal'
import * as customerService from '../../service/customerService'

const CustomersPage = () => {
    const { user } = useAuth()
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const customersPerPage = 10

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const data = await customerService.getCustomers()
            setCustomers(data)
        } catch (error) {
            console.error('Error al cargar clientes:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los clientes',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCustomer = () => {
        setSelectedCustomer(null)
        setIsModalOpen(true)
    }

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer)
        setIsModalOpen(true)
    }

    const handleDeleteCustomer = async (customer) => {
        const result = await Swal.fire({
            title: '¿Desactivar cliente?',
            text: `¿Estás seguro que deseas desactivar a ${customer.nombre} ${customer.apellidoP}?`,
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
                await customerService.deleteCustomer(customer._id)
                await fetchCustomers()
                Swal.fire({
                    title: '¡Cliente desactivado!',
                    text: 'El cliente ha sido desactivado correctamente.',
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
                    text: 'No se pudo desactivar el cliente',
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
        setSelectedCustomer(null)
    }

    const handleModalSuccess = () => {
        fetchCustomers()
        handleModalClose()
    }

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchCustomers()
            return
        }

        try {
            setLoading(true)
            const data = await customerService.searchCustomers(searchTerm)
            setCustomers(data)
            setCurrentPage(1)
        } catch (error) {
            console.error('Error en búsqueda:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        fetchCustomers()
        setCurrentPage(1)
    }

    // Filtrar y paginar clientes
    const indexOfLastCustomer = currentPage * customersPerPage
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage
    const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer)
    const totalPages = Math.ceil(customers.length / customersPerPage)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-900">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-zinc-400">Cargando clientes...</p>
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
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Gestión de Clientes</h1>
                            <p className="text-zinc-400">Administra la información de tus clientes</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateCustomer}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Nuevo Cliente</span>
                    </button>
                </div>

                {/* Búsqueda y filtros */}
                <div className="bg-zinc-800 rounded-xl p-6 mb-6 border border-zinc-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por código, nombre, apellido o email..."
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

                        <div className="flex space-x-3">
                            <button
                                onClick={handleSearch}
                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <span>Buscar</span>
                            </button>

                            {searchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="flex items-center space-x-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-3 rounded-lg transition-colors duration-200"
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
                                <p className="text-zinc-400 text-sm">Total Clientes</p>
                                <p className="text-2xl font-bold text-white">{customers.length}</p>
                            </div>
                            <div className="bg-blue-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Clientes Activos</p>
                                <p className="text-2xl font-bold text-white">{customers.filter(c => c.estado_cliente).length}</p>
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
                                <p className="text-zinc-400 text-sm">Clientes Inactivos</p>
                                <p className="text-2xl font-bold text-white">{customers.filter(c => !c.estado_cliente).length}</p>
                            </div>
                            <div className="bg-red-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de clientes */}
                <div className="bg-zinc-800 rounded-xl shadow-lg border border-zinc-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-700">
                        <h2 className="text-lg font-semibold text-white">Lista de Clientes</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Nombre Completo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Teléfono</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-700">
                                {currentCustomers.length > 0 ? (
                                    currentCustomers.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-zinc-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                {customer.codigo_cliente}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {`${customer.nombre} ${customer.apellidoP} ${customer.apellidoM}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {customer.correo_electronico || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {customer.telefono || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer.estado_cliente
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {customer.estado_cliente ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditCustomer(customer)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                                        title="Editar cliente"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                    </button>

                                                    {customer.estado_cliente && (
                                                        <button
                                                            onClick={() => handleDeleteCustomer(customer)}
                                                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                                            title="Desactivar cliente"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
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
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-lg font-medium">No se encontraron clientes</p>
                                                <p className="text-sm">
                                                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer cliente'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {customers.length > customersPerPage && (
                        <div className="px-6 py-3 border-t border-zinc-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-zinc-400">
                                    Mostrando {indexOfFirstCustomer + 1} a {Math.min(indexOfLastCustomer, customers.length)} de {customers.length} clientes
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
                <CustomerModal
                    customer={selectedCustomer}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    )
}

export default CustomersPage