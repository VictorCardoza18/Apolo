import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import * as saleService from '../../service/saleService'
import Swal from 'sweetalert2'

const SaleModal = ({ sale, onClose, onSuccess }) => {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        codigo_venta: '',
        cliente: '',
        productos: [],
        metodo_pago: 'efectivo'
    })
    const [products, setProducts] = useState([])
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [currentProduct, setCurrentProduct] = useState({
        producto: '',
        cantidad: 1
    })

    const paymentMethods = [
        { value: 'efectivo', label: 'Efectivo' },
        { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
        { value: 'tarjeta_debito', label: 'Tarjeta de Débito' },
        { value: 'transferencia', label: 'Transferencia' }
    ]

    useEffect(() => {
        loadData()
        if (sale) {
            setFormData({
                codigo_venta: sale.codigo_venta || '',
                cliente: sale.cliente?._id || '',
                productos: sale.productos || [],
                metodo_pago: sale.metodo_pago || 'efectivo'
            })
        } else {
            generateSaleCode()
        }
    }, [sale])

    const loadData = async () => {
        try {
            const [productsData, customersData] = await Promise.all([
                saleService.getProducts(),
                saleService.getCustomers()
            ])
            setProducts(productsData)
            setCustomers(customersData)
        } catch (error) {
            console.error('Error al cargar datos:', error)
        }
    }

    const generateSaleCode = () => {
        const timestamp = Date.now().toString().slice(-6)
        const code = `VTA-${timestamp}`
        setFormData(prev => ({ ...prev, codigo_venta: code }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleProductChange = (e) => {
        const { name, value } = e.target
        setCurrentProduct(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const addProduct = () => {
        if (!currentProduct.producto || currentProduct.cantidad <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Producto incompleto',
                text: 'Selecciona un producto y especifica una cantidad válida',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
            return
        }

        const product = products.find(p => p._id === currentProduct.producto)
        if (!product) return

        if (currentProduct.cantidad > product.stock_actual) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock insuficiente',
                text: `Solo hay ${product.stock_actual} unidades disponibles`,
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
            return
        }

        // Verificar si el producto ya está en la lista
        const existingIndex = formData.productos.findIndex(p => p.producto === currentProduct.producto)

        if (existingIndex >= 0) {
            // Actualizar cantidad
            const newProducts = [...formData.productos]
            newProducts[existingIndex].cantidad = parseInt(currentProduct.cantidad)
            setFormData(prev => ({ ...prev, productos: newProducts }))
        } else {
            // Agregar nuevo producto
            const newProduct = {
                producto: currentProduct.producto,
                cantidad: parseInt(currentProduct.cantidad),
                precio_unitario: product.precio,
                subtotal: product.precio * parseInt(currentProduct.cantidad)
            }
            setFormData(prev => ({
                ...prev,
                productos: [...prev.productos, newProduct]
            }))
        }

        setCurrentProduct({ producto: '', cantidad: 1 })
    }

    const removeProduct = (index) => {
        const newProducts = formData.productos.filter((_, i) => i !== index)
        setFormData(prev => ({ ...prev, productos: newProducts }))
    }

    const calculateTotal = () => {
        return formData.productos.reduce((total, item) => {
            const product = products.find(p => p._id === item.producto)
            if (product) {
                return total + (product.precio * item.cantidad)
            }
            return total
        }, 0)
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.codigo_venta.trim()) {
            newErrors.codigo_venta = 'El código de venta es requerido'
        }

        if (formData.productos.length === 0) {
            newErrors.productos = 'Debe agregar al menos un producto'
        }

        if (!formData.metodo_pago) {
            newErrors.metodo_pago = 'Selecciona un método de pago'
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
                cliente: formData.cliente || null
            }

            if (sale) {
                // Actualizar (solo estado en este caso)
                await saleService.updateSaleStatus(sale._id, { estado_venta: formData.estado_venta })
                Swal.fire({
                    title: '¡Venta actualizada!',
                    text: 'La venta ha sido actualizada correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#27272a',
                    color: '#ffffff',
                    iconColor: '#10b981'
                })
            } else {
                await saleService.createSale(dataToSend)
                Swal.fire({
                    title: '¡Venta creada!',
                    text: 'La venta ha sido registrada correctamente.',
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
            console.error('Error al guardar venta:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo guardar la venta',
                background: '#27272a',
                color: '#ffffff',
                iconColor: '#ef4444',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setLoading(false)
        }
    }

    const getProductName = (productId) => {
        const product = products.find(p => p._id === productId)
        return product ? `${product.codigo_producto} - ${product.nombre_producto}` : 'Producto no encontrado'
    }

    const getProductPrice = (productId) => {
        const product = products.find(p => p._id === productId)
        return product ? product.precio : 0
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700">
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                    <h2 className="text-xl font-semibold text-white">
                        {sale ? 'Ver Venta' : 'Nueva Venta'}
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
                        {/* Código de venta */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Código de Venta *
                            </label>
                            <input
                                type="text"
                                name="codigo_venta"
                                value={formData.codigo_venta}
                                onChange={handleChange}
                                disabled={sale}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.codigo_venta ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${sale ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                placeholder="VTA-000001"
                            />
                            {errors.codigo_venta && (
                                <p className="text-red-400 text-sm mt-1">{errors.codigo_venta}</p>
                            )}
                        </div>

                        {/* Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Cliente (opcional)
                            </label>
                            <select
                                name="cliente"
                                value={formData.cliente}
                                onChange={handleChange}
                                disabled={sale}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${sale ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <option value="">Seleccionar cliente...</option>
                                {customers.map(customer => (
                                    <option key={customer._id} value={customer._id}>
                                        {customer.codigo_cliente} - {customer.nombre} {customer.apellidoP}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Método de pago */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Método de Pago *
                            </label>
                            <select
                                name="metodo_pago"
                                value={formData.metodo_pago}
                                onChange={handleChange}
                                disabled={sale}
                                className={`w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border ${errors.metodo_pago ? 'border-red-500' : 'border-zinc-600'
                                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${sale ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {paymentMethods.map(method => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                            {errors.metodo_pago && (
                                <p className="text-red-400 text-sm mt-1">{errors.metodo_pago}</p>
                            )}
                        </div>

                        {/* Vendedor */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Vendedor
                            </label>
                            <input
                                type="text"
                                value={sale?.vendedor?.username || user?.username || ''}
                                disabled
                                className="w-full bg-zinc-600 text-zinc-300 px-4 py-3 rounded-lg border border-zinc-600 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Productos */}
                    {!sale && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-4">
                                Productos *
                            </label>

                            {/* Agregar producto */}
                            <div className="bg-zinc-700 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-2">
                                        <select
                                            name="producto"
                                            value={currentProduct.producto}
                                            onChange={handleProductChange}
                                            className="w-full bg-zinc-600 text-white px-4 py-2 rounded-lg border border-zinc-500 focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">Seleccionar producto...</option>
                                            {products.map(product => (
                                                <option key={product._id} value={product._id}>
                                                    {product.codigo_producto} - {product.nombre_producto} (Stock: {product.stock_actual}) - ${product.precio}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            name="cantidad"
                                            value={currentProduct.cantidad}
                                            onChange={handleProductChange}
                                            min="1"
                                            className="w-full bg-zinc-600 text-white px-4 py-2 rounded-lg border border-zinc-500 focus:border-blue-500 focus:outline-none"
                                            placeholder="Cantidad"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={addProduct}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {errors.productos && (
                                <p className="text-red-400 text-sm mb-4">{errors.productos}</p>
                            )}
                        </div>
                    )}

                    {/* Lista de productos */}
                    <div>
                        <h3 className="text-lg font-medium text-white mb-4">
                            Productos en la venta ({formData.productos.length})
                        </h3>

                        <div className="bg-zinc-700 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-zinc-600">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Producto</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Cantidad</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Precio Unit.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Subtotal</th>
                                        {!sale && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Acciones</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-600">
                                    {formData.productos.length > 0 ? (
                                        formData.productos.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    {sale ?
                                                        `${item.producto?.codigo_producto} - ${item.producto?.nombre_producto}` :
                                                        getProductName(item.producto)
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">{item.cantidad}</td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    ${sale ? item.precio_unitario : getProductPrice(item.producto)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    ${sale ? item.subtotal : (getProductPrice(item.producto) * item.cantidad).toFixed(2)}
                                                </td>
                                                {!sale && (
                                                    <td className="px-4 py-3 text-sm">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProduct(index)}
                                                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={sale ? 4 : 5} className="px-4 py-8 text-center text-zinc-400">
                                                No hay productos agregados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="mt-4 bg-zinc-600 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-white">Total General:</span>
                                <span className="text-2xl font-bold text-green-400">
                                    ${sale ? sale.total_general : calculateTotal().toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors duration-200"
                        >
                            {sale ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!sale && (
                            <button
                                type="submit"
                                disabled={loading || formData.productos.length === 0}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                )}
                                <span>Crear Venta</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SaleModal