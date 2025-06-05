import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'

const RegisterPage = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm()
    const { register: registerUser } = useAuth()
    const navigate = useNavigate()

    const onSubmit = async (data) => {
        // Mostrar loading mientras procesa
        Swal.fire({
            title: 'Registrando usuario...',
            didOpen: () => {
                Swal.showLoading()
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false
        })

        const result = await registerUser(data.username, data.email, data.password)

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'Tu cuenta ha sido creada correctamente',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/dashboard', { replace: true })
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al registrarse',
                text: result.message
            })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Crear una cuenta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        O{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            inicia sesión si ya tienes una cuenta
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="form-label">
                                Nombre de usuario
                            </label>
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                className="input-field"
                                {...register('username', {
                                    required: 'El nombre de usuario es obligatorio',
                                    minLength: {
                                        value: 3,
                                        message: 'El nombre de usuario debe tener al menos 3 caracteres'
                                    }
                                })}
                            />
                            {errors.username && <p className="error-message">{errors.username.message}</p>}
                        </div>

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
                                autoComplete="new-password"
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

                        <div>
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="input-field"
                                {...register('confirmPassword', {
                                    required: 'Confirma tu contraseña',
                                    validate: value => value === watch('password') || 'Las contraseñas no coinciden'
                                })}
                            />
                            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="btn-primary w-full py-3"
                        >
                            Registrarse
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage