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
            <nav className="bg-gradient-to-r from-zinc-800 to-zinc-900 shadow-xl border-b border-zinc-700/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo y Título - Izquierda */}
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center group" onClick={closeMenu}>
                                {/* Nuevo icono más atractivo y profesional */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                </div>
                                {/* Nuevo título más profesional */}
                                <div className="ml-3">
                                    <div className="flex items-baseline">
                                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            APOLO
                                        </span>
                                        <span className="text-sm font-medium text-zinc-400 ml-1">
                                            POS
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-500 leading-none">
                                        Sistema de Ventas
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Información del Usuario - Centro */}
                        {isAuthenticated() && (
                            <div className="flex items-center space-x-4 bg-zinc-800/50 rounded-lg px-4 py-2 border border-zinc-700/50">
                                {/* Avatar del usuario */}
                                <div className="relative">
                                    <div className={`p-2 rounded-full ring-2 ${user?.isActive
                                            ? isAdmin
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 ring-purple-500/30'
                                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 ring-blue-500/30'
                                            : 'bg-gradient-to-r from-red-600 to-orange-600 ring-red-500/30'
                                        }`}>
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    {/* Indicador de estado */}
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-800 ${user?.isActive ? 'bg-emerald-500' : 'bg-red-500'
                                        }`}></div>
                                </div>

                                {/* Información del usuario */}
                                <div className="hidden sm:block">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-left">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-white font-medium text-sm">
                                                    {user?.username}
                                                </span>
                                                {/* Badge de permisos */}
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${isAdmin
                                                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border border-purple-500/30'
                                                        : 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 border border-blue-500/30'
                                                    }`}>
                                                    {isAdmin ? '👑 Administrador' : '👤 Usuario'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${user?.isActive
                                                        ? 'bg-emerald-600/20 text-emerald-300'
                                                        : 'bg-red-600/20 text-red-300'
                                                    }`}>
                                                    {user?.isActive ? '🟢 Activo' : '🔴 Inactivo'}
                                                </span>
                                                <span className="text-zinc-500 text-xs">
                                                    ID: {user?.username}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Versión móvil - Solo nombre */}
                                <div className="block sm:hidden">
                                    <div className="text-white font-medium text-sm">
                                        {user?.username}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${isAdmin ? 'bg-purple-600/20 text-purple-300' : 'bg-blue-600/20 text-blue-300'
                                            }`}>
                                            {isAdmin ? 'Admin' : 'User'}
                                        </span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${user?.isActive ? 'bg-emerald-600/20 text-emerald-300' : 'bg-red-600/20 text-red-300'
                                            }`}>
                                            {user?.isActive ? 'ON' : 'OFF'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Menú Hamburguesa - Derecha (sin cambios) */}
                        <div className="flex items-center">
                            <button
                                onClick={toggleMenu}
                                className="text-zinc-300 hover:text-white p-2 rounded-md hover:bg-zinc-700/50 transition-all duration-200 relative group"
                                aria-label="Menú principal"
                            >
                                {/* Efecto de brillo en hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 rounded-md transition-all duration-300"></div>
                                <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Menú desplegable (sin cambios en funcionalidad) */}
            {isMenuOpen && (
                <>
                    {/* Overlay para cerrar el menú */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
                        onClick={closeMenu}
                    ></div>

                    {/* Menú deslizante con scroll */}
                    <div className="fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-2xl z-50 border-l border-zinc-700/50 flex flex-col backdrop-blur-sm">
                        {/* Header del menú - Fijo */}
                        <div className="flex-shrink-0 p-6 border-b border-zinc-700/50 bg-zinc-800/50">
                            {isAuthenticated() && (
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-full ring-2 ${user?.isActive
                                            ? isAdmin
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 ring-purple-500/30'
                                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 ring-blue-500/30'
                                            : 'bg-gradient-to-r from-red-600 to-orange-600 ring-red-500/30'
                                        }`}>
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Hola, {user?.username}</p>
                                        <p className="text-zinc-400 text-sm">{user?.email}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${isAdmin
                                                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border border-purple-500/30'
                                                    : 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 border border-blue-500/30'
                                                }`}>
                                                {isAdmin ? '👑 Administrador' : '👤 Usuario'}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${user?.isActive
                                                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                                                    : 'bg-red-600/20 text-red-300 border border-red-500/30'
                                                }`}>
                                                {user?.isActive ? '🟢 Activo' : '🔴 Inactivo'}
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
                                                    className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                    onClick={closeMenu}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-1 rounded bg-zinc-700 group-hover:bg-zinc-600 transition-colors">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <span>Inicio</span>
                                                    </div>
                                                </Link>

                                                {/* Dashboard - Solo administradores */}
                                                {isAdmin && (
                                                    <Link
                                                        to="/dashboard"
                                                        className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                        onClick={closeMenu}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-1 rounded bg-purple-600/20 group-hover:bg-purple-600/30 transition-colors">
                                                                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <span>Dashboard</span>
                                                            <span className="ml-auto bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                                                                Admin
                                                            </span>
                                                        </div>
                                                    </Link>
                                                )}

                                                {/* Punto de Venta - Todos los usuarios */}
                                                <Link
                                                    to="/pos"
                                                    className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                    onClick={closeMenu}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-1 rounded bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors">
                                                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M3 4a1 1 0 011-1h1.586a1 1 0 01.707.293L7.414 4H10a1 1 0 110 2H6.414l-1-1H4v11a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 112 0v7a3 3 0 01-3 3H5a3 3 0 01-3-3V4z" />
                                                                <path d="M13 6a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM6.5 9.5a1 1 0 112 0V12a1 1 0 11-2 0V9.5zM10.5 9.5a1 1 0 112 0V12a1 1 0 11-2 0V9.5z" />
                                                            </svg>
                                                        </div>
                                                        <span>Punto de Venta (POS)</span>
                                                    </div>
                                                </Link>

                                                {/* Gestión de Clientes - Todos los usuarios */}
                                                <Link
                                                    to="/customers"
                                                    className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                    onClick={closeMenu}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-1 rounded bg-emerald-600/20 group-hover:bg-emerald-600/30 transition-colors">
                                                            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <span>Gestión de Clientes</span>
                                                    </div>
                                                </Link>

                                                {/* Secciones solo para administradores */}
                                                {isAdmin && (
                                                    <>
                                                        <div className="pt-4 border-t border-zinc-700/50">
                                                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3 px-4 flex items-center">
                                                                <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                                </svg>
                                                                Administración
                                                            </p>

                                                            <Link
                                                                to="/sales"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="p-1 rounded bg-green-600/20 group-hover:bg-green-600/30 transition-colors">
                                                                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                    <span>Gestión de Ventas</span>
                                                                    <span className="ml-auto bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                                                                        Admin
                                                                    </span>
                                                                </div>
                                                            </Link>

                                                            <Link
                                                                to="/products"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="p-1 rounded bg-orange-600/20 group-hover:bg-orange-600/30 transition-colors">
                                                                        <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                    <span>Gestión de Productos</span>
                                                                    <span className="ml-auto bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                                                                        Admin
                                                                    </span>
                                                                </div>
                                                            </Link>

                                                            <Link
                                                                to="/suppliers"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="p-1 rounded bg-amber-600/20 group-hover:bg-amber-600/30 transition-colors">
                                                                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    </div>
                                                                    <span>Gestión de Proveedores</span>
                                                                    <span className="ml-auto bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                                                                        Admin
                                                                    </span>
                                                                </div>
                                                            </Link>

                                                            <Link
                                                                to="/users"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="p-1 rounded bg-indigo-600/20 group-hover:bg-indigo-600/30 transition-colors">
                                                                        <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    </div>
                                                                    <span>Gestión de Usuarios</span>
                                                                    <span className="ml-auto bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                                                                        Admin
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        </div>

                                                        {/* Reportes y configuración para admins */}
                                                        <div className="pt-4 border-t border-zinc-700/50">
                                                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3 px-4 flex items-center">
                                                                <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                                                </svg>
                                                                Reportes y Análisis
                                                            </p>

                                                            <Link
                                                                to="/reports/sales"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="p-1 rounded bg-green-600/20 group-hover:bg-green-600/30 transition-colors">
                                                                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                                                        </svg>
                                                                    </div>
                                                                    <span>Reporte de Ventas</span>
                                                                    <span className="ml-auto bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                                                                        Admin
                                                                    </span>
                                                                </div>
                                                            </Link>

                                                            <Link
                                                                to="/settings"
                                                                className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                                onClick={closeMenu}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="p-1 rounded bg-zinc-600/20 group-hover:bg-zinc-600/30 transition-colors">
                                                                        <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                    <span>Configuración</span>
                                                                    <span className="ml-auto bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                                                                        Admin
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Ayuda para todos */}
                                                <div className="pt-4 border-t border-zinc-700/50">
                                                    <Link
                                                        to="/help"
                                                        className="block px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-700/50 rounded-md transition-all duration-200 group"
                                                        onClick={closeMenu}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-1 rounded bg-cyan-600/20 group-hover:bg-cyan-600/30 transition-colors">
                                                                <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <span>Ayuda y Soporte</span>
                                                        </div>
                                                    </Link>
                                                </div>

                                                {/* Espacio adicional */}
                                                <div className="h-4"></div>
                                            </div>
                                        ) : (
                                            <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-4">
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
                                                className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md text-center font-medium transition-all duration-200"
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
                            <div className="flex-shrink-0 p-6 border-t border-zinc-700/50 bg-zinc-800/50">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-all duration-200 text-left group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-1 rounded bg-red-600/20 group-hover:bg-red-600/30 transition-colors">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
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