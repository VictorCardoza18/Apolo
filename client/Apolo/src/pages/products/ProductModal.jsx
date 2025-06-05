import { useState, useEffect } from 'react'
import * as productService from '../../service/productService'
import Swal from 'sweetalert2'

const ProductModal = ({ product, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        codigo_producto: '',
        nombre_producto: '',
        descripcion_producto: '',
        codigo_proveedor: '',
        precio: '',
        stock_minimo: 5,
        stock_actual: 0,
        unidad_medida: 'unidad',
        categoria_producto: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const unidadesMedida = [
        { value: 'unidad', label: 'Unidad' },
        { value: 'kg', label: 'Kilogramo' },
        { value: 'litro', label: 'Litro' },
        { value: 'paquete', label: 'Paquete' }
    ]

    useEffect(() => {
        if (product) {
            setFormData({
                codigo_producto: product.codigo_producto || '',
                nombre_producto: product.nombre_producto || '',
                descripcion_producto: product.descripcion_producto || '',
                codigo_proveedor: product.codigo_proveedor || '',
                precio: product.precio || '',
                stock_minimo: product.stock_minimo || 5,
                stock_actual: product.stock_actual || 0,
                unidad_medida: product.unidad_medida || 'unidad',
                categoria_producto: product.categoria_producto || ''
            })
        }
    }, [product])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
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

        if (!formData.codigo_producto.trim()) {
            newErrors.codigo_producto = 'El código del producto es requerido'
        }

        if (!formData.nombre_producto.trim()) {
            newErrors.nombre_producto = 'El nombre del producto es requerido'
        }

        if (!formData.descripcion_producto.trim()) {
            newErrors.descripcion_producto = 'La descripción es requerida'
        }

        if (!formData.precio || formData.precio < 0) {
            newErrors.precio = 'El precio debe ser mayor o igual a 0'
        }

        if (formData.stock_minimo < 0) {
            newErrors.stock_minimo = 'El stock mínimo debe ser mayor o igual a 0'
        }

        if (formData.stock_actual < 0) {
            newErrors.stock_actual = 'El stock actual debe ser mayor o igual a 0'
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
                precio: Number(formData.precio),
                stock_minimo: Number(formData.stock_minimo),
                stock_actual: Number(formData.stock_actual)
            }

            if (product) {
                await productService.updateProduct(product._id, dataToSend)
                Swal.fire({
                    title: '¡Producto actualizado!',
                    text: 'El producto ha sido actualizado correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#10b981'
                })
            } else {
                await productService.createProduct(dataToSend)
                Swal.fire({
                    title: '¡Producto creado!',
                    text: 'El producto ha sido creado correctamente.',
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
            console.error('Error al guardar producto:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo guardar el producto',
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
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
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
                        {/* Código del producto */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Código del Producto *
                            </label>
                            <input
                                type="text"
                                name="codigo_producto"
                                value={formData.codigo_producto}
                                onChange={handleChange}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.codigo_producto ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="Ingresa el código del producto"
                            />
                            {errors.codigo_producto && (
                                <p className="text-red-400 text-sm mt-1">{errors.codigo_producto}</p>
                            )}
                        </div>

                        {/* Nombre del producto */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                name="nombre_producto"
                                value={formData.nombre_producto}
                                onChange={handleChange}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.nombre_producto ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="Ingresa el nombre del producto"
                            />
                            {errors.nombre_producto && (
                                <p className="text-red-400 text-sm mt-1">{errors.nombre_producto}</p>
                            )}
                        </div>

                        {/* Código del proveedor */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Código del Proveedor
                            </label>
                            <input
                                type="text"
                                name="codigo_proveedor"
                                value={formData.codigo_proveedor}
                                onChange={handleChange}
                                className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="Código del proveedor"
                            />
                        </div>

                        {/* Categoría */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Categoría
                            </label>
                            <input
                                type="text"
                                name="categoria_producto"
                                value={formData.categoria_producto}
                                onChange={handleChange}
                                className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="Categoría del producto"
                            />
                        </div>

                        {/* Precio */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Precio *
                            </label>
                            <input
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.precio ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="0.00"
                            />
                            {errors.precio && (
                                <p className="text-red-400 text-sm mt-1">{errors.precio}</p>
                            )}
                        </div>

                        {/* Unidad de medida */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Unidad de Medida
                            </label>
                            <select
                                name="unidad_medida"
                                value={formData.unidad_medida}
                                onChange={handleChange}
                                className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                {unidadesMedida.map(unidad => (
                                    <option key={unidad.value} value={unidad.value}>
                                        {unidad.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stock mínimo */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Stock Mínimo
                            </label>
                            <input
                                type="number"
                                name="stock_minimo"
                                value={formData.stock_minimo}
                                onChange={handleChange}
                                min="0"
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.stock_minimo ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="5"
                            />
                            {errors.stock_minimo && (
                                <p className="text-red-400 text-sm mt-1">{errors.stock_minimo}</p>
                            )}
                        </div>

                        {/* Stock actual */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Stock Actual
                            </label>
                            <input
                                type="number"
                                name="stock_actual"
                                value={formData.stock_actual}
                                onChange={handleChange}
                                min="0"
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.stock_actual ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                placeholder="0"
                            />
                            {errors.stock_actual && (
                                <p className="text-red-400 text-sm mt-1">{errors.stock_actual}</p>
                            )}
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Descripción *
                        </label>
                        <textarea
                            name="descripcion_producto"
                            value={formData.descripcion_producto}
                            onChange={handleChange}
                            rows={4}
                            className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.descripcion_producto ? 'border-red-500' : 'border-zinc-600'
                                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none`}
                            placeholder="Descripción del producto"
                        />
                        {errors.descripcion_producto && (
                            <p className="text-red-400 text-sm mt-1">{errors.descripcion_producto}</p>
                        )}
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
                            <span>{product ? 'Actualizar' : 'Crear'} Producto</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProductModal