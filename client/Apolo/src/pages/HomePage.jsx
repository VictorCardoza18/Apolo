import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'

const HomePage = () => {
    const { isAuthenticated } = useAuth()

    return (
        <div className="bg-gradient-to-b from-primary-50 to-white min-h-screen">
            <div className="page-container">
                <div className="py-12 md:py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary-800 mb-4">
                        Sistema de Punto de Venta y Gestión de Inventarios
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Una solución completa para gestionar tu negocio, controlar tu inventario y aumentar tus ventas con inteligencia artificial.
                    </p>

                    {isAuthenticated() ? (
                        <Link to="/dashboard" className="btn-primary text-lg px-6 py-3">
                            Ir al Dashboard
                        </Link>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="btn-primary text-lg px-6 py-3">
                                Iniciar Sesión
                            </Link>
                            <Link to="/register" className="btn-secondary text-lg px-6 py-3">
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>

                <div className="py-12">
                    <h2 className="text-3xl font-bold text-center text-primary-800 mb-12">
                        Características Principales
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card">
                            <h3 className="text-xl font-semibold text-primary-700 mb-3">Punto de Venta</h3>
                            <p className="text-gray-600">
                                Procesa ventas rápidamente, gestiona clientes y mantén un registro detallado de todas las transacciones.
                            </p>
                        </div>

                        <div className="card">
                            <h3 className="text-xl font-semibold text-primary-700 mb-3">Gestión de Inventario</h3>
                            <p className="text-gray-600">
                                Controla tu stock en tiempo real, recibe alertas de productos con bajo inventario y gestiona proveedores.
                            </p>
                        </div>

                        <div className="card">
                            <h3 className="text-xl font-semibold text-primary-700 mb-3">Inteligencia Artificial</h3>
                            <p className="text-gray-600">
                                Obtén predicciones de ventas, recomendaciones de inventario y análisis de patrones de compra de tus clientes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage