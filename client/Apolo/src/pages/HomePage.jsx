import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'

const HomePage = () => {
    const { isAuthenticated } = useAuth()

    return (
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-800 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="py-16 md:py-24 text-center">
                    <div className="mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="bg-zinc-700 p-4 rounded-full">
                                <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Sistema de Punto de Venta
                            <span className="block text-blue-400">con Inteligencia Artificial</span>
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Una solución completa y moderna para gestionar tu negocio, controlar tu inventario y maximizar tus ventas con el poder de la inteligencia artificial.
                        </p>
                    </div>

                    {isAuthenticated() ? (
                        <div className="space-y-4">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-blue-500/25"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                </svg>
                                Ir al Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-blue-500/25"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 102 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Iniciar Sesión
                            </Link>

                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div className="py-16">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Características Principales
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                            Descubre todas las funcionalidades que Apolo POS tiene para ofrecer a tu negocio
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Característica 1 */}
                        <div className="bg-zinc-800 p-8 rounded-xl border border-zinc-700 hover:border-zinc-600 transition-colors duration-200 group">
                            <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors duration-200">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Punto de Venta</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Procesa ventas de manera rápida y eficiente, gestiona clientes y mantén un registro detallado de todas las transacciones en tiempo real.
                            </p>
                        </div>

                        {/* Característica 2 */}
                        <div className="bg-zinc-800 p-8 rounded-xl border border-zinc-700 hover:border-zinc-600 transition-colors duration-200 group">
                            <div className="bg-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors duration-200">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 10v6h8v-6H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Gestión de Inventario</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Controla tu stock en tiempo real, recibe alertas automáticas de productos con bajo inventario y gestiona proveedores eficientemente.
                            </p>
                        </div>

                        {/* Característica 3 */}
                        <div className="bg-zinc-800 p-8 rounded-xl border border-zinc-700 hover:border-zinc-600 transition-colors duration-200 group">
                            <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors duration-200">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Inteligencia Artificial</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Obtén predicciones precisas de ventas, recomendaciones inteligentes de inventario y análisis avanzados de patrones de compra.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="py-16 border-t border-zinc-700">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            ¿Listo para transformar tu negocio?
                        </h3>
                        <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
                            Únete a cientos de empresarios que ya confían en Apolo POS para gestionar sus negocios de manera inteligente.
                        </p>

                        {!isAuthenticated() && (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                                >
                                    Comenzar ahora
                                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage