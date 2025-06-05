import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import * as customerService from '../../service/customerService'

const CustomerModal = ({ customer, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm()
    const [loading, setLoading] = useState(false)
    const isEditing = !!customer

    useEffect(() => {
        if (customer) {
            // Llenar el formulario con los datos del cliente
            Object.keys(customer).forEach(key => {
                setValue(key, customer[key])
            })
        } else {
            reset()
        }
    }, [customer, setValue, reset])

    const generateCustomerCode = () => {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        return `CLI${timestamp}${random}`
    }

    const onSubmit = async (data) => {
        try {
            setLoading(true)

            // Si no es edición y no hay código, generar uno
            if (!isEditing && !data.codigo_cliente) {
                data.codigo_cliente = generateCustomerCode()
            }

            let result
            if (isEditing) {
                result = await customerService.updateCustomer(customer._id, data)
            } else {
                result = await customerService.createCustomer(data)
            }

            Swal.fire({
                icon: 'success',
                title: isEditing ? '¡Cliente actualizado!' : '¡Cliente creado!',
                text: `El cliente ha sido ${isEditing ? 'actualizado' : 'creado'} correctamente`,
                timer: 1500,
                showConfirmButton: false,
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#10b981'
            })

            onSuccess()
        } catch (error) {
            console.error('Error al guardar cliente:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el cliente`,
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Estilos CSS para el modal */}
            <style jsx global>{`
                .modal-overlay {
                    background-color: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                }
            `}</style>

            {/* Overlay */}
            <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-700">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600/20 p-2 rounded-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-white">
                                {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-700 transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                        {/* Código de Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Código de Cliente
                            </label>
                            <input
                                type="text"
                                placeholder={isEditing ? "Código actual" : "Se generará automáticamente"}
                                className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                {...register('codigo_cliente', {
                                    required: isEditing ? 'El código es obligatorio' : false
                                })}
                                readOnly={!isEditing}
                            />
                            {errors.codigo_cliente && (
                                <p className="text-red-400 text-sm mt-1">{errors.codigo_cliente.message}</p>
                            )}
                        </div>

                        {/* Información Personal */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    {...register('nombre', {
                                        required: 'El nombre es obligatorio',
                                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                    })}
                                />
                                {errors.nombre && (
                                    <p className="text-red-400 text-sm mt-1">{errors.nombre.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Apellido Paterno *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Apellido paterno"
                                    className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    {...register('apellidoP', {
                                        required: 'El apellido paterno es obligatorio',
                                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                    })}
                                />
                                {errors.apellidoP && (
                                    <p className="text-red-400 text-sm mt-1">{errors.apellidoP.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Apellido Materno *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Apellido materno"
                                    className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    {...register('apellidoM', {
                                        required: 'El apellido materno es obligatorio',
                                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                    })}
                                />
                                {errors.apellidoM && (
                                    <p className="text-red-400 text-sm mt-1">{errors.apellidoM.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Información de Contacto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    placeholder="email@ejemplo.com"
                                    className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    {...register('correo_electronico', {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Correo electrónico inválido'
                                        }
                                    })}
                                />
                                {errors.correo_electronico && (
                                    <p className="text-red-400 text-sm mt-1">{errors.correo_electronico.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    placeholder="123-456-7890"
                                    className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    {...register('telefono', {
                                        pattern: {
                                            value: /^[\d\-\+\(\)\s]+$/,
                                            message: 'Formato de teléfono inválido'
                                        }
                                    })}
                                />
                                {errors.telefono && (
                                    <p className="text-red-400 text-sm mt-1">{errors.telefono.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Dirección */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Dirección
                            </label>
                            <textarea
                                placeholder="Dirección completa"
                                rows="3"
                                className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                                {...register('direccion')}
                            />
                        </div>

                        {/* Razón Social */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Razón Social
                            </label>
                            <input
                                type="text"
                                placeholder="Razón social (opcional)"
                                className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                {...register('razon_social')}
                            />
                        </div>

                        {/* Estado del Cliente (solo en edición) */}
                        {isEditing && (
                            <div>
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                                        {...register('estado_cliente')}
                                    />
                                    <span className="text-sm font-medium text-zinc-300">Cliente activo</span>
                                </label>
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-zinc-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors duration-200"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                disabled={loading}
                            >
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                )}
                                <span>{isEditing ? 'Actualizar' : 'Crear'} Cliente</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default CustomerModal