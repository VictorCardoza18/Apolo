import { useState, useEffect } from 'react'
import * as supplierService from '../../service/supplierService'
import Swal from 'sweetalert2'

const SupplierModal = ({ supplier, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        codigo_proveedor: '',
        nombre_proveedor: '',
        telefono: '',
        direccion: '',
        correo_electronico: '',
        estado_proveedor: true
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (supplier) {
            setFormData({
                codigo_proveedor: supplier.codigo_proveedor || '',
                nombre_proveedor: supplier.nombre_proveedor || '',
                telefono: supplier.telefono || '',
                direccion: supplier.direccion || '',
                correo_electronico: supplier.correo_electronico || '',
                estado_proveedor: supplier.estado_proveedor !== undefined ? supplier.estado_proveedor : true
            })
        } else {
            // Generar código automático para nuevo proveedor
            generateSupplierCode()
        }
    }, [supplier])

    const generateSupplierCode = () => {
        const timestamp = Date.now().toString().slice(-6)
        const code = `PROV-${timestamp}`
        setFormData(prev => ({ ...prev, codigo_proveedor: code }))
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        const newValue = type === 'checkbox' ? checked : value

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }))

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.codigo_proveedor.trim()) {
            newErrors.codigo_proveedor = 'El código de proveedor es requerido'
        }

        if (!formData.nombre_proveedor.trim()) {
            newErrors.nombre_proveedor = 'El nombre del proveedor es requerido'
        } else if (formData.nombre_proveedor.trim().length < 2) {
            newErrors.nombre_proveedor = 'El nombre debe tener al menos 2 caracteres'
        }

        if (formData.correo_electronico && !/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
            newErrors.correo_electronico = 'Formato de email inválido'
        }

        if (formData.telefono && formData.telefono.length < 10) {
            newErrors.telefono = 'El teléfono debe tener al menos 10 dígitos'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            const dataToSend = {
                ...formData,
                codigo_proveedor: formData.codigo_proveedor.trim().toUpperCase(),
                nombre_proveedor: formData.nombre_proveedor.trim(),
                telefono: formData.telefono.trim(),
                direccion: formData.direccion.trim(),
                correo_electronico: formData.correo_electronico.trim().toLowerCase()
            }

            if (supplier) {
                await supplierService.updateSupplier(supplier._id, dataToSend)
                Swal.fire({
                    title: '¡Proveedor actualizado!',
                    text: 'El proveedor ha sido actualizado correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#10b981'
                })
            } else {
                await supplierService.createSupplier(dataToSend)
                Swal.fire({
                    title: '¡Proveedor creado!',
                    text: 'El proveedor ha sido creado correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#10b981'
                })
            }

            onSuccess()
        } catch (error) {
            console.error('Error al guardar proveedor:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo guardar el proveedor',
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700">
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                    <h2 className="text-xl font-semibold text-white">
                        {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Código de proveedor */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Código de Proveedor *
                            </label>
                            <input
                                type="text"
                                name="codigo_proveedor"
                                value={formData.codigo_proveedor}
                                onChange={handleChange}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.codigo_proveedor ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="PROV-000001"
                            />
                            {errors.codigo_proveedor && (
                                <p className="text-red-400 text-sm mt-1">{errors.codigo_proveedor}</p>
                            )}
                        </div>

                        {/* Nombre del proveedor */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Nombre del Proveedor *
                            </label>
                            <input
                                type="text"
                                name="nombre_proveedor"
                                value={formData.nombre_proveedor}
                                onChange={handleChange}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.nombre_proveedor ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="Ingresa el nombre del proveedor"
                            />
                            {errors.nombre_proveedor && (
                                <p className="text-red-400 text-sm mt-1">{errors.nombre_proveedor}</p>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.telefono ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="(55) 1234-5678"
                            />
                            {errors.telefono && (
                                <p className="text-red-400 text-sm mt-1">{errors.telefono}</p>
                            )}
                        </div>

                        {/* Correo electrónico */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                name="correo_electronico"
                                value={formData.correo_electronico}
                                onChange={handleChange}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.correo_electronico ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="proveedor@ejemplo.com"
                            />
                            {errors.correo_electronico && (
                                <p className="text-red-400 text-sm mt-1">{errors.correo_electronico}</p>
                            )}
                        </div>
                    </div>

                    {/* Dirección */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Dirección
                        </label>
                        <textarea
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            rows="3"
                            className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                            placeholder="Dirección completa del proveedor"
                        />
                    </div>

                    {/* Estado del proveedor */}
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            name="estado_proveedor"
                            checked={formData.estado_proveedor}
                            onChange={handleChange}
                            className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <label className="text-sm font-medium text-zinc-300">
                            Proveedor activo
                        </label>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            )}
                            <span>{supplier ? 'Actualizar' : 'Crear'} Proveedor</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SupplierModal