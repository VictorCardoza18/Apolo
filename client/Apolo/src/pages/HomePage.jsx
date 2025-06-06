import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

const HomePage = () => {
    const { isAuthenticated, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        // Si el usuario está autenticado y es un usuario normal, redirigir al POS
        if (isAuthenticated() && user?.isActive && !(user?.role === 'admin' || user?.isAdmin)) {
            navigate('/pos')
        }
    }, [isAuthenticated, user, navigate])

    const isAdmin = user?.role === 'admin' || user?.isAdmin

    return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6">
            <div className="max-w-4xl mx-auto text-center">
                {/* Logo y título */}
                <div className="mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-600 p-6 rounded-full">
                            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">Apolo POS</h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Sistema de punto de venta moderno y eficiente para tu negocio
                    </p>
                </div>

                {/* Opciones basadas en autenticación */}
                {isAuthenticated() ? (
                    <div className="space-y-8">
                        <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700">
                            <h2 className="text-2xl font-semibold text-white mb-4">
                                ¡Bienvenido de vuelta, {user?.username}!
                            </h2>
                            <p className="text-zinc-400 mb-6">
                                {isAdmin
                                    ? 'Como administrador, tienes acceso completo a todas las funcionalidades del sistema.'
                                    : 'Accede rápidamente a tus herramientas principales.'
                                }
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* POS - Para todos los usuarios */}
                                <Link
                                    to="/pos"
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors duration-200 group"
                                >
                                    <div className="flex flex-col items-center space-y-3">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3 4a1 1 0 011-1h1.586a1 1 0 01.707.293L7.414 4H10a1 1 0 110 2H6.414l-1-1H4v11a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 112 0v7a3 3 0 01-3 3H5a3 3 0 01-3-3V4z" />
                                        </svg>
                                        <span className="font-medium">Punto de Venta</span>
                                        <span className="text-sm opacity-80">Realizar ventas</span>
                                    </div>
                                </Link>

                                {/* Clientes - Para todos los usuarios */}
                                <Link
                                    to="/customers"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-lg transition-colors duration-200 group"
                                >
                                    <div className="flex flex-col items-center space-y-3">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">Clientes</span>
                                        <span className="text-sm opacity-80">Gestionar clientes</span>
                                    </div>
                                </Link>

                                {/* Dashboard - Solo administradores */}
                                {isAdmin && (
                                    <Link
                                        to="/dashboard"
                                        className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg transition-colors duration-200 group"
                                    >
                                        <div className="flex flex-col items-center space-y-3">
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium">Dashboard</span>
                                            <span className="text-sm opacity-80">Panel de control</span>
                                        </div>
                                    </Link>
                                )}

                                {/* Productos - Solo administradores */}
                                {isAdmin && (
                                    <Link
                                        to="/products"
                                        className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg transition-colors duration-200 group"
                                    >
                                        <div className="flex flex-col items-center space-y-3">
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium">Productos</span>
                                            <span className="text-sm opacity-80">Inventario</span>
                                        </div>
                                    </Link>
                                )}

                                {/* Ventas - Solo administradores */}
                                {isAdmin && (
                                    <Link
                                        to="/sales"
                                        className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors duration-200 group"
                                    >
                                        <div className="flex flex-col items-center space-y-3">
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium">Reportes de Ventas</span>
                                            <span className="text-sm opacity-80">Análisis</span>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Información del usuario */}
                        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                            <div className="flex items-center justify-center space-x-4">
                                <div className={`p-3 rounded-full ${user?.isActive ? 'bg-emerald-600/20' : 'bg-red-600/20'}`}>
                                    <svg className={`w-6 h-6 ${user?.isActive ? 'text-emerald-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-medium">{user?.username}</p>
                                    <p className="text-zinc-400 text-sm">{user?.email}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${isAdmin ? 'bg-purple-600/20 text-purple-400' : 'bg-blue-600/20 text-blue-400'
                                            }`}>
                                            {isAdmin ? 'Administrador' : 'Usuario'}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${user?.isActive ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
                                            }`}>
                                            {user?.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Para usuarios no autenticados
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                                <div className="bg-blue-600/20 p-3 rounded-lg w-fit mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 4a1 1 0 011-1h1.586a1 1 0 01.707.293L7.414 4H10a1 1 0 110 2H6.414l-1-1H4v11a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 112 0v7a3 3 0 01-3 3H5a3 3 0 01-3-3V4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Punto de Venta</h3>
                                <p className="text-zinc-400 text-sm">Interfaz intuitiva y rápida para procesar ventas</p>
                            </div>

                            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                                <div className="bg-emerald-600/20 p-3 rounded-lg w-fit mx-auto mb-4">
                                    <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Gestión de Inventario</h3>
                                <p className="text-zinc-400 text-sm">Control completo de productos y stock</p>
                            </div>

                            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                                <div className="bg-purple-600/20 p-3 rounded-lg w-fit mx-auto mb-4">
                                    <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Reportes y Analytics</h3>
                                <p className="text-zinc-400 text-sm">Análisis detallado de ventas y rendimiento</p>
                            </div>
                        </div>

                        <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700">
                            <h2 className="text-2xl font-semibold text-white mb-4">¿Listo para comenzar?</h2>
                            <p className="text-zinc-400 mb-6">
                                Inicia sesión para acceder a todas las funcionalidades del sistema
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Iniciar Sesión</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HomePage