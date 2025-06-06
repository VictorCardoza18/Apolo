import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Swal from 'sweetalert2'

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Verificar si el usuario es administrador
    const isAdmin = user?.role === 'admin' || user?.isAdmin

    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro que deseas cerrar tu sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0284c7',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            background: '#27272a',
            color: '#ffffff'
        }).then((result) => {
            if (result.isConfirmed) {
                logout()
                Swal.fire({
                    title: '¡Sesión cerrada!',
                    text: 'Has cerrado sesión correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#27272a',
                    color: '#ffffff'
                })
                navigate('/')
                setIsMenuOpen(false)
            }
        })
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    return (
        <>
            <nav className="bg-zinc-800 shadow-lg border-b border-zinc-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo - Izquierda */}
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
                                <div className="text-white">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-xl font-bold text-white">Apolo POS</span>
                            </Link>
                        </div>

                        {/* Icono de Usuario - Centro */}
                        {isAuthenticated() && (
                            <div className="flex items-center">
                                <div className={`p-2 rounded-full ${user?.isActive ? 'bg-zinc-700' : 'bg-red-700'}`}>
                                    <svg className="w-6 h-6 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Menú Hamburguesa - Derecha */}
                        <div className="flex items-center">
                            <button
                                onClick={toggleMenu}
                                className="text-zinc-300 hover:text-white p-2 rounded-md hover:bg-zinc-700 transition-colors duration-200"
                                aria-label="Menú principal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Menú desplegable */}
            {isMenuOpen && (
                <>
                    {/* Overlay para cerrar el menú */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeMenu}
                    ></div>

                    {/* Menú deslizante con scroll */}
                    <div className="fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-zinc-800 shadow-xl z-50 border-l border-zinc-700 flex flex-col">
                        {/* Header del menú - Fijo */}
                        <div className="flex-shrink-0 p-6 border-b border-zinc-700">
                            {isAuthenticated() && (
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-full ${user?.isActive ? 'bg-zinc-700' : 'bg-red-700'}`}>
                                        <svg className="w-6 h-6 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Hola, {user?.username}</p>
                                        <p className="text-zinc-400 text-sm">{user?.email}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`text-xs px-2 py-1 rounded-full ${isAdmin
                                                    ? 'bg-purple-600/20 text-purple-400'
                                                    : 'bg-blue-600/20 text-blue-400'
                                                }`}>
                                                {isAdmin ? 'Administrador' : 'Usuario'}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${user?.isActive
                                                    ? 'bg-emerald-600/20 text-emerald-400'
                                                    : 'bg-red-600/20 text-red-400'
                                                }`}>
                                                {user?.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Área de navegación con scroll */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6">
                                {isAuthenticated() ? (
                                    <>
                                        {/* Enlaces de navegación - Solo si el usuario está activo */}
                                        {user?.isActive ? (
                                            <div className="space-y-2">
                                                <Link
                                                    to="/"
                                                    className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                    onClick={closeMenu}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Inicio</span>
                                                    </div>
                                                </Link>

                                                {/* Dashboard - Solo administradores */}
                                                {isAdmin && (
                                                    <Link
                                                        to="/dashboard"
                                                        className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                        onClick={closeMenu}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Dashboard</span>
                                                            <span className="ml-auto bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded">Admin</span>
                                                        </div>
                                                    </Link>
                                                )}

                                                {/* Punto de Venta - Todos los usuarios */}
                                                <Link
                                                    to="/pos"
                                                    className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                    onClick={closeMenu}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M3 4a1 1 0 011-1h1.586a1 1 0 01.707.293L7.414 4H10a1 1 0 110 2H6.414l-1-1H4v11a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 112 0v7a3 3 0 01-3 3H5a3 3 0 01-3-3V4z" />
                                                            <path d="M13 6a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM6.5 9.5a1 1 0 112 0V12a1 1 0 11-2 0V9.5zM10.5 9.5a1 1 0 112 0V12a1 1 0 11-2 0V9.5z" />
                                                        </svg>
                                                        <span>Punto de Venta (POS)</span>
                                                    </div>
                                                </Link>

                                                {/* Gestión de Clientes - Todos los usuarios */}
                                                <Link
                                                    to="/customers"
                                                    className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                    onClick={closeMenu}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Gestión de Clientes</span>
                                                    </div>
                                                </Link>

                                                {/* Secciones solo para administradores */}
                                                {isAdmin && (
                                                    <>
                                                        <div className="pt-4 border-t border-zinc-700">
                                                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2 px-4">Administración</p>

                                                            <Link
                                                                to="/sales"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span>Gestión de Ventas</span>
                                                                    <span className="ml-auto bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded">Admin</span>
                                                                </div>
                                                            </Link>

                                                            <Link
                                                                to="/products"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span>Gestión de Productos</span>
                                                                    <span className="ml-auto bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded">Admin</span>
                                                                </div>
                                                            </Link>

                                                            <Link
                                                                to="/suppliers"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span>Gestión de Proveedores</span>
                                                                    <span className="ml-auto bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded">Admin</span>
                                                                </div>
                                                            </Link>

                                                            <Link
                                                                to="/users"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span>Gestión de Usuarios</span>
                                                                    <span className="ml-auto bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded">Admin</span>
                                                                </div>
                                                            </Link>
                                                        </div>

                                                        {/* Reportes y configuración para admins */}
                                                        <div className="pt-4 border-t border-zinc-700">
                                                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2 px-4">Reportes y Configuración</p>

                                                            <Link
                                                                to="/reports/sales"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                                                    </svg>
                                                                    <span>Reporte de Ventas</span>
                                                                    <span className="ml-auto bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded">Admin</span>
                                                                </div>
                                                            </Link>

                                                            <Link
                                                                to="/settings"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span>Configuración</span>
                                                                    <span className="ml-auto bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded">Admin</span>
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Ayuda para todos */}
                                                <div className="pt-4 border-t border-zinc-700">
                                                    <Link
                                                        to="/help"
                                                        className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md transition-colors duration-200"
                                                        onClick={closeMenu}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Ayuda y Soporte</span>
                                                        </div>
                                                    </Link>
                                                </div>

                                                {/* Espacio adicional */}
                                                <div className="h-4"></div>
                                            </div>
                                        ) : (
                                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-red-400 font-medium text-sm">Cuenta Inactiva</p>
                                                        <p className="text-red-300 text-xs">Contacta al administrador para reactivar tu cuenta</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center mb-6">
                                            <h3 className="text-white text-lg font-medium mb-2">¡Bienvenido!</h3>
                                            <p className="text-zinc-400 text-sm">Inicia sesión para acceder al sistema</p>
                                        </div>

                                        <div className="space-y-3">
                                            <Link
                                                to="/login"
                                                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center font-medium transition-colors duration-200"
                                                onClick={closeMenu}
                                            >
                                                Iniciar sesión
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botón de cerrar sesión - Fijo en la parte inferior */}
                        {isAuthenticated() && (
                            <div className="flex-shrink-0 p-6 border-t border-zinc-700 bg-zinc-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-zinc-700 rounded-md transition-colors duration-200 text-left"
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                        </svg>
                                        <span>Cerrar sesión</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    )
}

export default Navbar