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
            showConfirmButton: false
        })

        const result = await login(data.email, data.password)

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Has iniciado sesión correctamente',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate(from, { replace: true })
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar sesión',
                text: result.message
            })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Iniciar sesión
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        O{' '}
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                            regístrate si aún no tienes una cuenta
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="form-label">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className="input-field"
                                {...register('email', {
                                    required: 'El correo electrónico es obligatorio',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Correo electrónico inválido'
                                    }
                                })}
                            />
                            {errors.email && <p className="error-message">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                className="input-field"
                                {...register('password', {
                                    required: 'La contraseña es obligatoria',
                                    minLength: {
                                        value: 6,
                                        message: 'La contraseña debe tener al menos 6 caracteres'
                                    }
                                })}
                            />
                            {errors.password && <p className="error-message">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="btn-primary w-full py-3"
                        >
                            Iniciar sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginPage