import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Swal from 'sweetalert2'

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

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
                                <div className="bg-zinc-700 p-2 rounded-full">
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

                    {/* Menú deslizante */}
                    <div className="fixed top-16 right-0 w-80 bg-zinc-800 shadow-xl z-50 border-l border-zinc-700">
                        <div className="p-6">
                            {isAuthenticated() ? (
                                <div className="space-y-4">
                                    {/* Información del usuario */}
                                    <div className="border-b border-zinc-700 pb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-zinc-700 p-3 rounded-full">
                                                <svg className="w-6 h-6 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Hola, {user?.username}</p>
                                                <p className="text-zinc-400 text-sm">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enlaces de navegación */}
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
                                            </div>
                                        </Link>

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
                                    </div>

                                    {/* Botón de cerrar sesión */}
                                    <div className="pt-4 border-t border-zinc-700">
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
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center mb-6">
                                        <h3 className="text-white text-lg font-medium mb-2">¡Bienvenido!</h3>
                                        <p className="text-zinc-400 text-sm">Inicia sesión para acceder a todas las funciones</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            to="/login"
                                            className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center font-medium transition-colors duration-200"
                                            onClick={closeMenu}
                                        >
                                            Iniciar sesión
                                        </Link>

                                        <Link
                                            to="/register"
                                            className="block w-full px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md text-center font-medium transition-colors duration-200"
                                            onClick={closeMenu}
                                        >
                                            Registrarse
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default Navbar