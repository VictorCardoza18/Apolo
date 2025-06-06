import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import * as saleService from '../../service/saleService'
import Swal from 'sweetalert2'

const POSPage = () => {
    const { user } = useAuth()
    const barcodeInputRef = useRef(null)
    const [products, setProducts] = useState([])
    const [customers, setCustomers] = useState([])
    const [cart, setCart] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('efectivo')
    const [searchTerm, setSearchTerm] = useState('')
    const [barcodeInput, setBarcodeInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [receivedAmount, setReceivedAmount] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    const paymentMethods = [
        { value: 'efectivo', label: 'Efectivo', icon: '💵' },
        { value: 'tarjeta_credito', label: 'Tarjeta Crédito', icon: '💳' },
        { value: 'tarjeta_debito', label: 'Tarjeta Débito', icon: '💳' },
        { value: 'transferencia', label: 'Transferencia', icon: '🏦' }
    ]

    useEffect(() => {
        loadData()
        // Enfocar el input de código de barras al cargar
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus()
        }
    }, [])

    const loadData = async () => {
        try {
            const [productsData, customersData] = await Promise.all([
                saleService.getProducts(),
                saleService.getCustomers()
            ])
            setProducts(productsData.filter(p => p.stock_actual > 0))
            setCustomers(customersData)
        } catch (error) {
            console.error('Error al cargar datos:', error)
        }
    }

    // Filtrar productos por búsqueda
    const filteredProducts = products.filter(product =>
        product.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Manejar código de barras/búsqueda rápida
    const handleBarcodeSubmit = (e) => {
        e.preventDefault()
        if (!barcodeInput.trim()) return

        const product = products.find(p =>
            p.codigo_producto.toLowerCase() === barcodeInput.toLowerCase() ||
            p.nombre_producto.toLowerCase().includes(barcodeInput.toLowerCase())
        )

        if (product) {
            addToCart(product)
            setBarcodeInput('')
            if (barcodeInputRef.current) {
                barcodeInputRef.current.focus()
            }
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Producto no encontrado',
                text: `No se encontró un producto con el código: ${barcodeInput}`,
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb',
                timer: 2000,
                showConfirmButton: false
            })
            setBarcodeInput('')
        }
    }

    // Agregar producto al carrito
    const addToCart = (product, quantity = 1) => {
        const existingItem = cart.find(item => item.product._id === product._id)

        if (existingItem) {
            // Verificar stock antes de incrementar
            if (existingItem.quantity + quantity > product.stock_actual) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Stock insuficiente',
                    text: `Solo hay ${product.stock_actual} unidades disponibles`,
                    background: '#27272a',
                    color: '#ffffff',
                    confirmButtonColor: '#2563eb',
                    timer: 2000,
                    showConfirmButton: false
                })
                return
            }
            updateCartQuantity(product._id, existingItem.quantity + quantity)
        } else {
            if (quantity > product.stock_actual) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Stock insuficiente',
                    text: `Solo hay ${product.stock_actual} unidades disponibles`,
                    background: '#27272a',
                    color: '#ffffff',
                    confirmButtonColor: '#2563eb',
                    timer: 2000,
                    showConfirmButton: false
                })
                return
            }
            setCart(prev => [...prev, {
                product,
                quantity,
                price: product.precio,
                subtotal: product.precio * quantity
            }])
        }
    }

    // Actualizar cantidad en carrito
    const updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId)
            return
        }

        const product = products.find(p => p._id === productId)
        if (newQuantity > product.stock_actual) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock insuficiente',
                text: `Solo hay ${product.stock_actual} unidades disponibles`,
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb',
                timer: 2000,
                showConfirmButton: false
            })
            return
        }

        setCart(prev => prev.map(item =>
            item.product._id === productId
                ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
                : item
        ))
    }

    // Remover producto del carrito
    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product._id !== productId))
    }

    // Limpiar carrito
    const clearCart = () => {
        Swal.fire({
            title: '¿Limpiar carrito?',
            text: 'Se eliminarán todos los productos del carrito',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar',
            background: '#27272a',
            color: '#ffffff'
        }).then((result) => {
            if (result.isConfirmed) {
                setCart([])
                setSelectedCustomer(null)
            }
        })
    }

    // Calcular totales
    const subtotal = cart.reduce((total, item) => total + item.subtotal, 0)
    const tax = subtotal * 0.16 // 16% IVA
    const total = subtotal + tax

    // Procesar venta
    const processSale = async () => {
        if (cart.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Carrito vacío',
                text: 'Agrega productos al carrito antes de procesar la venta',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
            return
        }

        if (paymentMethod === 'efectivo') {
            setShowPaymentModal(true)
        } else {
            await completeSale()
        }
    }

    // Completar venta
    const completeSale = async (cash = null) => {
        setIsProcessing(true)

        try {
            // Generar código de venta único
            const saleCode = `POS-${Date.now()}`

            const saleData = {
                codigo_venta: saleCode,
                cliente: selectedCustomer?._id || null,
                productos: cart.map(item => ({
                    producto: item.product._id,
                    cantidad: item.quantity,
                    precio_unitario: item.price,
                    subtotal: item.subtotal
                })),
                metodo_pago: paymentMethod,
                total_general: total
            }

            const sale = await saleService.createSale(saleData)

            // Mostrar ticket de venta
            await showSaleTicket(sale, cash)

            // Limpiar estado
            setCart([])
            setSelectedCustomer(null)
            setPaymentMethod('efectivo')
            setReceivedAmount('')
            setShowPaymentModal(false)

            // Recargar productos para actualizar stock
            await loadData()

            // Enfocar input de código de barras
            if (barcodeInputRef.current) {
                barcodeInputRef.current.focus()
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al procesar venta',
                text: error.response?.data?.message || 'No se pudo completar la venta',
                background: '#27272a',
                color: '#ffffff',
                confirmButtonColor: '#2563eb'
            })
        } finally {
            setIsProcessing(false)
        }
    }

    // Mostrar ticket de venta
    const showSaleTicket = async (sale, cash = null) => {
        const change = cash ? (parseFloat(cash) - total) : 0

        const ticketHtml = `
            <div class="text-left font-mono text-sm">
                <div class="text-center mb-4">
                    <h3 class="font-bold text-lg">APOLO POS</h3>
                    <p class="text-xs">Ticket de Venta</p>
                    <p class="text-xs">${new Date().toLocaleString()}</p>
                </div>
                
                <div class="border-t border-b border-gray-400 py-2 mb-2">
                    <p><strong>Código:</strong> ${sale.codigo_venta}</p>
                    <p><strong>Vendedor:</strong> ${user.username}</p>
                    ${selectedCustomer ? `<p><strong>Cliente:</strong> ${selectedCustomer.nombre} ${selectedCustomer.apellidoP}</p>` : ''}
                </div>

                <div class="mb-4">
                    ${cart.map(item => `
                        <div class="flex justify-between mb-1">
                            <div class="flex-1">
                                <p class="text-xs">${item.product.nombre_producto}</p>
                                <p class="text-xs text-gray-400">${item.quantity} x $${item.price.toFixed(2)}</p>
                            </div>
                            <p class="font-bold">$${item.subtotal.toFixed(2)}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="border-t border-gray-400 pt-2">
                    <div class="flex justify-between">
                        <p>Subtotal:</p>
                        <p>$${subtotal.toFixed(2)}</p>
                    </div>
                    <div class="flex justify-between">
                        <p>IVA (16%):</p>
                        <p>$${tax.toFixed(2)}</p>
                    </div>
                    <div class="flex justify-between font-bold text-lg">
                        <p>Total:</p>
                        <p>$${total.toFixed(2)}</p>
                    </div>
                    
                    ${cash ? `
                        <div class="border-t border-gray-400 pt-2 mt-2">
                            <div class="flex justify-between">
                                <p>Efectivo recibido:</p>
                                <p>$${parseFloat(cash).toFixed(2)}</p>
                            </div>
                            <div class="flex justify-between font-bold">
                                <p>Cambio:</p>
                                <p>$${change.toFixed(2)}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="text-center mt-4 text-xs">
                    <p>¡Gracias por su compra!</p>
                    <p>Vuelva pronto</p>
                </div>
            </div>
        `

        await Swal.fire({
            title: '¡Venta completada!',
            html: ticketHtml,
            icon: 'success',
            confirmButtonText: 'Imprimir Ticket',
            showCancelButton: true,
            cancelButtonText: 'Cerrar',
            background: '#27272a',
            color: '#ffffff',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            width: '500px'
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí iría la lógica de impresión
                window.print()
            }
        })
    }

    // Atajos de teclado
    useEffect(() => {
        const handleKeyPress = (e) => {
            // F1 - Enfocar búsqueda
            if (e.key === 'F1') {
                e.preventDefault()
                if (barcodeInputRef.current) {
                    barcodeInputRef.current.focus()
                }
            }
            // F2 - Procesar venta
            if (e.key === 'F2') {
                e.preventDefault()
                processSale()
            }
            // F3 - Limpiar carrito
            if (e.key === 'F3') {
                e.preventDefault()
                clearCart()
            }
        }

        document.addEventListener('keydown', handleKeyPress)
        return () => document.removeEventListener('keydown', handleKeyPress)
    }, [cart, paymentMethod])

    return (
        <div className="min-h-screen bg-zinc-900 flex">
            {/* Panel izquierdo - Productos */}
            <div className="flex-1 p-6">
                <div className="bg-zinc-800 rounded-xl h-full border border-zinc-700 flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Productos</h2>
                            <div className="text-sm text-zinc-400">
                                {filteredProducts.length} productos disponibles
                            </div>
                        </div>

                        {/* Búsqueda rápida y código de barras */}
                        <div className="space-y-3">
                            <form onSubmit={handleBarcodeSubmit} className="flex space-x-2">
                                <input
                                    ref={barcodeInputRef}
                                    type="text"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    placeholder="Código de barras o nombre (F1)"
                                    className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </form>

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filtrar productos..."
                                className="w-full bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Grid de productos */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <div
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    className="bg-zinc-700 rounded-lg p-4 cursor-pointer hover:bg-zinc-600 transition-colors duration-200 border border-zinc-600 hover:border-blue-500"
                                >
                                    <div className="text-center">
                                        <div className="bg-zinc-600 rounded-lg p-4 mb-3">
                                            <svg className="w-12 h-12 text-zinc-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-white font-medium text-sm mb-1 truncate">
                                            {product.nombre_producto}
                                        </h3>
                                        <p className="text-zinc-400 text-xs mb-2">
                                            {product.codigo_producto}
                                        </p>
                                        <p className="text-green-400 font-bold text-lg">
                                            ${product.precio.toFixed(2)}
                                        </p>
                                        <p className="text-zinc-500 text-xs">
                                            Stock: {product.stock_actual}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                                <svg className="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                                </svg>
                                <p className="text-lg">No hay productos disponibles</p>
                                <p className="text-sm">Revisa tu búsqueda o stock</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Panel derecho - Carrito y pago */}
            <div className="w-96 p-6">
                <div className="bg-zinc-800 rounded-xl h-full border border-zinc-700 flex flex-col">
                    {/* Header del carrito */}
                    <div className="p-6 border-b border-zinc-700">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Carrito</h2>
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                                {cart.length} items
                            </span>
                        </div>
                    </div>

                    {/* Items del carrito */}
                    <div className="flex-1 overflow-y-auto">
                        {cart.length > 0 ? (
                            <div className="p-6 space-y-4">
                                {cart.map(item => (
                                    <div key={item.product._id} className="bg-zinc-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-white font-medium text-sm">
                                                {item.product.nombre_producto}
                                            </h3>
                                            <button
                                                onClick={() => removeFromCart(item.product._id)}
                                                className="text-red-400 hover:text-red-300 ml-2"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                                                    className="bg-zinc-600 hover:bg-zinc-500 text-white w-8 h-8 rounded flex items-center justify-center"
                                                >
                                                    -
                                                </button>
                                                <span className="text-white font-medium w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                                                    className="bg-zinc-600 hover:bg-zinc-500 text-white w-8 h-8 rounded flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-zinc-400 text-xs">
                                                    ${item.price.toFixed(2)} c/u
                                                </p>
                                                <p className="text-green-400 font-bold">
                                                    ${item.subtotal.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                                <svg className="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h1.586a1 1 0 01.707.293L7.414 4H10a1 1 0 110 2H6.414l-1-1H4v11a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 112 0v7a3 3 0 01-3 3H5a3 3 0 01-3-3V4z" />
                                    <path d="M13 6a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM6.5 9.5a1 1 0 112 0V12a1 1 0 11-2 0V9.5zM10.5 9.5a1 1 0 112 0V12a1 1 0 11-2 0V9.5z" />
                                </svg>
                                <p className="text-lg mb-2">Carrito vacío</p>
                                <p className="text-sm text-center">
                                    Selecciona productos para agregarlos al carrito
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer - Totales y acciones */}
                    {cart.length > 0 && (
                        <div className="p-6 border-t border-zinc-700 space-y-4">
                            {/* Cliente */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Cliente (opcional)
                                </label>
                                <div className="flex space-x-2">
                                    <select
                                        value={selectedCustomer?._id || ''}
                                        onChange={(e) => {
                                            const customer = customers.find(c => c._id === e.target.value)
                                            setSelectedCustomer(customer || null)
                                        }}
                                        className="flex-1 bg-zinc-700 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none text-sm"
                                    >
                                        <option value="">Sin cliente</option>
                                        {customers.map(customer => (
                                            <option key={customer._id} value={customer._id}>
                                                {customer.nombre} {customer.apellidoP}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setShowCustomerModal(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                                        title="Nuevo cliente"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Método de pago */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Método de pago
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {paymentMethods.map(method => (
                                        <button
                                            key={method.value}
                                            onClick={() => setPaymentMethod(method.value)}
                                            className={`p-2 rounded-lg border transition-colors duration-200 text-sm ${paymentMethod === method.value
                                                    ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                                                    : 'border-zinc-600 bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                                }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-lg mb-1">{method.icon}</div>
                                                <div className="text-xs">{method.label}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Totales */}
                            <div className="bg-zinc-700 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-300">Subtotal:</span>
                                    <span className="text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-300">IVA (16%):</span>
                                    <span className="text-white">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-zinc-600 pt-2">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-white">Total:</span>
                                        <span className="text-2xl font-bold text-green-400">
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="space-y-2">
                                <button
                                    onClick={processSale}
                                    disabled={isProcessing}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            <span>Procesando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Procesar Venta (F2)</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={clearCart}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M10 5a2 2 0 00-2 2v6a2 2 0 104 0V7a2 2 0 00-2-2zM8 7a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V7z" clipRule="evenodd" />
                                    </svg>
                                    <span>Limpiar Carrito (F3)</span>
                                </button>
                            </div>

                            {/* Atajos de teclado */}
                            <div className="text-center">
                                <p className="text-zinc-500 text-xs">
                                    F1: Buscar | F2: Pagar | F3: Limpiar
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de pago en efectivo */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-xl p-8 max-w-md w-full mx-4 border border-zinc-700">
                        <h3 className="text-xl font-bold text-white mb-6 text-center">
                            Pago en Efectivo
                        </h3>

                        <div className="mb-6">
                            <div className="bg-zinc-700 rounded-lg p-4 mb-4">
                                <div className="text-center">
                                    <p className="text-zinc-300 text-sm">Total a pagar</p>
                                    <p className="text-3xl font-bold text-green-400">
                                        ${total.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Efectivo recibido
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={receivedAmount}
                                onChange={(e) => setReceivedAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 focus:border-blue-500 focus:outline-none text-lg"
                                autoFocus
                            />

                            {receivedAmount && parseFloat(receivedAmount) >= total && (
                                <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                                    <div className="text-center">
                                        <p className="text-green-400 text-sm">Cambio a entregar</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            ${(parseFloat(receivedAmount) - total).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {receivedAmount && parseFloat(receivedAmount) < total && (
                                <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                                    <div className="text-center">
                                        <p className="text-red-400 text-sm">Falta por pagar</p>
                                        <p className="text-xl font-bold text-red-400">
                                            ${(total - parseFloat(receivedAmount)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => completeSale(receivedAmount)}
                                disabled={!receivedAmount || parseFloat(receivedAmount) < total}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Completar Venta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default POSPage