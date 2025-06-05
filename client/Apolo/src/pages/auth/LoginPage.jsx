import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Obtener la página a la que redirigir después del login
    const from = location.state?.from?.pathname || '/dashboard'

    const onSubmit = async (data) => {
        // Mostrar loading mientras procesa
        Swal.fire({
            title: 'Iniciando sesión...',
            didOpen: () => {
                Swal.showLoading()
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            background: '#27272a',
            color: '#ffffff',
            customClass: {
                popup: 'dark-popup',
                title: 'dark-title',
                loader: 'dark-loader'
            }
        })

        const result = await login(data.email, data.password)

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Has iniciado sesión correctamente',
                timer: 1500,
                showConfirmButton: false,
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#10b981',
                customClass: {
                    popup: 'dark-popup',
                    title: 'dark-title',
                    content: 'dark-content'
                }
            }).then(() => {
                navigate(from, { replace: true })
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar sesión',
                text: result.message,
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Intentar de nuevo',
                customClass: {
                    popup: 'dark-popup',
                    title: 'dark-title',
                    content: 'dark-content',
                    confirmButton: 'dark-confirm-button'
                }
            })
        }
    }

    return (
        <>
            {/* Estilos CSS personalizados para SweetAlert2 */}
            <style jsx global>{`
                .dark-popup {
                    border: 1px solid #3f3f46 !important;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
                }
                
                .dark-title {
                    color: #ffffff !important;
                    font-weight: 600 !important;
                }
                
                .dark-content {
                    color: #d4d4d8 !important;
                }
                
                .dark-loader {
                    border-color: #2563eb !important;
                }
                
                .dark-confirm-button {
                    background-color: #2563eb !important;
                    border: none !important;
                    font-weight: 500 !important;
                    padding: 8px 16px !important;
                    border-radius: 6px !important;
                    transition: background-color 0.2s !important;
                }
                
                .dark-confirm-button:hover {
                    background-color: #1d4ed8 !important;
                }
                
                .dark-confirm-button:focus {
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3) !important;
                }
                
                /* Estilos para el spinner de carga */
                .swal2-loader {
                    border-color: #2563eb #2563eb #2563eb transparent !important;
                }
                
                /* Estilos para los iconos */
                .swal2-success-circular-line-left,
                .swal2-success-circular-line-right,
                .swal2-success-fix {
                    background-color: #27272a !important;
                }
                
                /* Overlay oscuro */
                .swal2-backdrop-show {
                    background-color: rgba(0, 0, 0, 0.6) !important;
                }
            `}</style>

            <div className='flex items-center justify-center min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8'>
                <div className='bg-zinc-800 max-w-md w-full p-10 rounded-md shadow-xl'>
                    <div className='text-center mb-8'>
                        <h1 className='text-3xl font-bold text-white mb-4'>Iniciar sesión</h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder='Correo electrónico'
                                className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                                {...register('email', {
                                    required: 'El correo electrónico es obligatorio',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Correo electrónico inválido'
                                    }
                                })}
                            />
                            {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
                        </div>

                        <div>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder='Contraseña'
                                className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                                {...register('password', {
                                    required: 'La contraseña es obligatoria',
                                    minLength: {
                                        value: 6,
                                        message: 'La contraseña debe tener al menos 6 caracteres'
                                    }
                                })}
                            />
                            {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors duration-200 mt-6'
                        >
                            Iniciar sesión
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default LoginPage