import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro que deseas cerrar tu sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0284c7',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                logout()
                Swal.fire({
                    title: '¡Sesión cerrada!',
                    text: 'Has cerrado sesión correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                })
                navigate('/')
            }
        })
    }

    return (
        <nav className="bg-primary-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold">Apolo POS</h1>
                        </Link>
                        <div className="hidden md:ml-6 md:flex md:space-x-4">
                            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600">
                                Inicio
                            </Link>
                            {isAuthenticated() && (
                                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600">
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center">
                        {isAuthenticated() ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm">Hola, {user?.username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600">
                                    Iniciar sesión
                                </Link>
                                <Link to="/register" className="px-3 py-2 bg-white text-primary-700 rounded-md text-sm font-medium hover:bg-gray-100">
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar