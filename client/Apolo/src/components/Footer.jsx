import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'

const Footer = () => {
    const { isAuthenticated, user } = useAuth()
    const isAdmin = user?.role === 'admin' || user?.isAdmin

    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-t border-zinc-700/50 mt-auto">
            {/* Contenido principal del footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Sección de la marca */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center mb-4">
                            {/* Logo del footer */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75"></div>
                                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="flex items-baseline">
                                    <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        APOLO
                                    </span>
                                    <span className="text-sm font-medium text-zinc-400 ml-1">
                                        POS
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-sm mb-4">
                            Sistema de punto de venta moderno y eficiente para optimizar las operaciones de tu negocio.
                        </p>

                        {/* Información de usuario si está logueado */}
                        {isAuthenticated() && (
                            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${user?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    <span className="text-zinc-300 text-sm">
                                        Conectado como <span className="font-medium text-white">{user?.username}</span>
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded ${isAdmin ? 'bg-purple-600/20 text-purple-300' : 'bg-blue-600/20 text-blue-300'
                                        }`}>
                                        {isAdmin ? 'Administrador' : 'Usuario'}
                                    </span>
                                    <span className="text-zinc-500 text-xs">
                                        Sesión activa
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enlaces de navegación */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Navegación
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 hover:pl-2">
                                    🏠 Inicio
                                </Link>
                            </li>
                            {isAuthenticated() && user?.isActive && (
                                <>
                                    <li>
                                        <Link to="/pos" className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 hover:pl-2">
                                            🛒 Punto de Venta
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/customers" className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 hover:pl-2">
                                            👥 Clientes
                                        </Link>
                                    </li>
                                    {isAdmin && (
                                        <>
                                            <li>
                                                <Link to="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 hover:pl-2">
                                                    📊 Dashboard
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/products" className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 hover:pl-2">
                                                    📦 Productos
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Herramientas y recursos */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            Herramientas
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/help" className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 hover:pl-2">
                                    ❓ Ayuda y Soporte
                                </Link>
                            </li>
                            {isAdmin && (
                                <>
                                    <li>
                                        <Link to="/reports/sales" className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 hover:pl-2">
                                            📈 Reportes
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/settings" className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 hover:pl-2">
                                            ⚙️ Configuración
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/users" className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 hover:pl-2">
                                            👨‍💼 Usuarios
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Información del sistema */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Sistema
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center text-zinc-400">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                Estado: Online
                            </li>
                            <li className="flex items-center text-zinc-400">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Versión: 2.0.1
                            </li>
                            <li className="flex items-center text-zinc-400">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Última actualización: Jun 2025
                            </li>
                            {isAuthenticated() && (
                                <li className="flex items-center text-zinc-400">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                    Tiempo de sesión: {new Date().toLocaleTimeString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </li>
                            )}
                        </ul>

                        {/* Estadísticas rápidas para admins */}
                        {isAuthenticated() && isAdmin && (
                            <div className="mt-4 bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
                                <h4 className="text-zinc-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                                    Estado del Sistema
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="text-center">
                                        <div className="text-emerald-400 font-bold">98.5%</div>
                                        <div className="text-zinc-500">Uptime</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-blue-400 font-bold">45ms</div>
                                        <div className="text-zinc-500">Latencia</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Separador con gradiente */}
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>

            {/* Footer inferior */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

                    {/* Copyright y desarrollador */}
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-zinc-400">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                            </svg>
                            <span>© {currentYear} APOLO POS. Todos los derechos reservados.</span>
                        </div>
                        <div className="hidden md:block w-px h-4 bg-zinc-700"></div>
                        <div className="flex items-center space-x-2">

                        </div>
                    </div>

                    {/* Enlaces legales y sociales */}
                    <div className="flex items-center space-x-6 text-sm">
                        <Link to="/privacy" className="text-zinc-400 hover:text-white transition-colors duration-200">
                            Privacidad
                        </Link>
                        <Link to="/terms" className="text-zinc-400 hover:text-white transition-colors duration-200">
                            Términos
                        </Link>

                        {/* Indicador de estado del servidor */}
                        <div className="flex items-center space-x-2 bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-700/50">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-zinc-300 text-xs font-medium">
                                Servidor en línea
                            </span>
                        </div>
                    </div>
                </div>

                {/* Mensaje motivacional para el usuario */}
                {isAuthenticated() && (
                    <div className="mt-4 pt-4 border-t border-zinc-700/30">
                        <div className="text-center">
                            <p className="text-zinc-500 text-xs">
                                {isAdmin ? (
                                    <>
                                        <span className="text-purple-400">👑</span>
                                        {" "}Tienes control total del sistema. ¡Administra sabiamente!
                                    </>
                                ) : (
                                    <>
                                        <span className="text-blue-400">💼</span>
                                        {" "}¡Que tengas un excelente día de ventas, {user?.username}!
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Barra de progreso decorativa */}
            <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-30"></div>
        </footer>
    )
}

export default Footer