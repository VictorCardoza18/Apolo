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
        <div className='flex items-center justify-center min-h-screen bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='bg-zinc-800 max-w-md w-full p-10 rounded-md shadow-xl'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-white mb-4'>Crear cuenta</h1>
                    <p className='text-zinc-400 text-sm'>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className='text-sky-500 hover:text-sky-400 font-medium'>
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <div>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            placeholder='Nombre de usuario'
                            className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                            {...register('username', {
                                required: 'El nombre de usuario es obligatorio',
                                minLength: {
                                    value: 3,
                                    message: 'El nombre de usuario debe tener al menos 3 caracteres'
                                }
                            })}
                        />
                        {errors.username && <p className='text-red-500 text-sm mt-1'>{errors.username.message}</p>}
                    </div>

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
                            autoComplete="new-password"
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

                    <div>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder='Confirmar contraseña'
                            className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                            {...register('confirmPassword', {
                                required: 'Confirma tu contraseña',
                                validate: value => value === watch('password') || 'Las contraseñas no coinciden'
                            })}
                        />
                        {errors.confirmPassword && <p className='text-red-500 text-sm mt-1'>{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors duration-200 mt-6'
                    >
                        Registrarse
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage