import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'
import UserModal from './UserModal'
import * as userService from '../../service/userService'

const UsersPage = () => {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const usersPerPage = 10

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await userService.getUsers()
            setUsers(data)
        } catch (error) {
            console.error('Error al cargar usuarios:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los usuarios',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = () => {
        setSelectedUser(null)
        setIsModalOpen(true)
    }

    const handleEditUser = (user) => {
        setSelectedUser(user)
        setIsModalOpen(true)
    }

    const handleDeleteUser = async (user) => {
        // Prevenir que se elimine a sí mismo
        if (user._id === currentUser._id) {
            Swal.fire({
                icon: 'warning',
                title: 'Acción no permitida',
                text: 'No puedes desactivar tu propia cuenta',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#f59e0b',
                confirmButtonColor: '#2563eb'
            })
            return
        }

        const result = await Swal.fire({
            title: '¿Desactivar usuario?',
            text: `¿Estás seguro que deseas desactivar a ${user.username}?`,
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
                await userService.deleteUser(user._id)
                await fetchUsers()
                Swal.fire({
                    title: '¡Usuario desactivado!',
                    text: 'El usuario ha sido desactivado correctamente.',
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
                    text: 'No se pudo desactivar el usuario',
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#ef4444',
                    confirmButtonColor: '#2563eb'
                })
            }
        }
    }

    const handleResetPassword = async (user) => {
        const result = await Swal.fire({
            title: 'Generar token de recuperación',
            text: `¿Generar un token de recuperación de contraseña para ${user.username}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, generar',
            cancelButtonText: 'Cancelar',
            background: '#27272a',
            color: '#ffffff'
        })

        if (result.isConfirmed) {
            try {
                const response = await userService.generateResetToken(user._id)

                Swal.fire({
                    title: 'Token generado',
                    html: `
                        <div class="text-left">
                            <p class="mb-2">Token de recuperación generado para ${user.username}</p>
                            <div class="bg-gray-800 p-3 rounded text-sm font-mono break-all">
                                ${response.resetToken}
                            </div>
                            <p class="mt-2 text-sm text-yellow-400">
                                ⚠️ Este token expira en 1 hora. Compártelo de forma segura con el usuario.
                            </p>
                        </div>
                    `,
                    icon: 'success',
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#10b981',
                    confirmButtonColor: '#2563eb'
                })
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo generar el token de recuperación',
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#ef4444',
                    confirmButtonColor: '#2563eb'
                })
            }
        }
    }

    const handleChangePassword = async (user) => {
        const { value: password } = await Swal.fire({
            title: 'Cambiar Contraseña',
            text: `Nueva contraseña para ${user.username}`,
            input: 'password',
            inputPlaceholder: 'Ingresa la nueva contraseña',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Cambiar',
            cancelButtonText: 'Cancelar',
            background: '#27272a',
            color: '#ffffff',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value) {
                    return 'La contraseña es requerida'
                }
                if (value.length < 6) {
                    return 'La contraseña debe tener al menos 6 caracteres'
                }
            }
        })

        if (password) {
            try {
                await userService.changeUserPassword(user._id, { password })
                Swal.fire({
                    title: '¡Contraseña cambiada!',
                    text: 'La contraseña ha sido actualizada correctamente.',
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
                    text: 'No se pudo cambiar la contraseña',
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
        setSelectedUser(null)
    }

    const handleModalSuccess = () => {
        fetchUsers()
        handleModalClose()
    }

    const handleSearch = () => {
        setCurrentPage(1)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setFilterRole('all')
        setFilterStatus('all')
        setCurrentPage(1)
    }

    // Filtrar usuarios
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' || user.role === filterRole
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.isActive) ||
            (filterStatus === 'inactive' && !user.isActive)
        return matchesSearch && matchesRole && matchesStatus
    })

    // Estadísticas
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.isActive).length
    const adminUsers = users.filter(u => u.isAdmin || u.role === 'admin').length
    const inactiveUsers = users.filter(u => !u.isActive).length

    // Paginar usuarios filtrados
    const indexOfLastUser = currentPage * usersPerPage
    const indexOfFirstUser = indexOfLastUser - usersPerPage
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

    const getRoleColor = (user) => {
        const isAdmin = user.isAdmin || user.role === 'admin'
        return isAdmin
            ? 'bg-purple-100 text-purple-800'
            : 'bg-blue-100 text-blue-800'
    }

    const getStatusColor = (isActive) => {
        return isActive
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-red-100 text-red-800'
    }

    const isUserAdmin = (user) => {
        return user.isAdmin || user.role === 'admin'
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Nunca'
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
                    <p className="text-zinc-400">Cargando usuarios...</p>
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
                            <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                            <p className="text-zinc-400">Administra los usuarios del sistema</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateUser}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Nuevo Usuario</span>
                    </button>
                </div>

                {/* Búsqueda y filtros */}
                <div className="bg-zinc-800 rounded-xl p-6 mb-6 border border-zinc-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre de usuario o email..."
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
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="all">Todos los roles</option>
                                <option value="admin">Administradores</option>
                                <option value="user">Usuarios</option>
                            </select>

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

                            {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
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
                                <p className="text-zinc-400 text-sm">Total Usuarios</p>
                                <p className="text-2xl font-bold text-white">{totalUsers}</p>
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
                                <p className="text-zinc-400 text-sm">Usuarios Activos</p>
                                <p className="text-2xl font-bold text-white">{activeUsers}</p>
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
                                <p className="text-zinc-400 text-sm">Administradores</p>
                                <p className="text-2xl font-bold text-white">{adminUsers}</p>
                            </div>
                            <div className="bg-purple-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Usuarios Inactivos</p>
                                <p className="text-2xl font-bold text-white">{inactiveUsers}</p>
                            </div>
                            <div className="bg-red-600/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 01-1.414 1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de usuarios */}
                <div className="bg-zinc-800 rounded-xl shadow-lg border border-zinc-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-700">
                        <h2 className="text-lg font-semibold text-white">Lista de Usuarios</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Creado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-700">
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-zinc-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-full ${user.isActive ? 'bg-zinc-700' : 'bg-red-700'}`}>
                                                        <svg className="w-5 h-5 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.username}</div>
                                                        {user._id === currentUser._id && (
                                                            <div className="text-xs text-blue-400">(Tú)</div>
                                                        )}
                                                        {user.resetPasswordToken && (
                                                            <div className="text-xs text-yellow-400">🔑 Token activo</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-1">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user)}`}>
                                                        {isUserAdmin(user) ? 'Administrador' : 'Usuario'}
                                                    </span>
                                                    {user.isAdmin && user.role !== 'admin' && (
                                                        <span className="text-xs text-yellow-400">⚠️ Inconsistencia</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                                                    {user.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                                        title="Editar usuario"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleChangePassword(user)}
                                                        className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                                                        title="Cambiar contraseña"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleResetPassword(user)}
                                                        className="text-orange-400 hover:text-orange-300 transition-colors duration-200"
                                                        title="Generar token de recuperación"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6zm12-6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>

                                                    {user._id !== currentUser._id && user.isActive && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                                            title="Desactivar usuario"
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
                                        <td colSpan="6" className="px-6 py-12 text-center text-zinc-400">
                                            <div className="flex flex-col items-center space-y-3">
                                                <svg className="w-12 h-12 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-lg font-medium">No se encontraron usuarios</p>
                                                <p className="text-sm">
                                                    {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer usuario'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {filteredUsers.length > usersPerPage && (
                        <div className="px-6 py-3 border-t border-zinc-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-zinc-400">
                                    Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
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
                <UserModal
                    user={selectedUser}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    )
}

export default UsersPage