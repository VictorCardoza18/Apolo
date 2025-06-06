import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import mongoose from 'mongoose';

// @desc    Obtener todas las ventas
// @route   GET /api/sales
// @access  Private
export const getSales = async (req, res) => {
    try {
        const sales = await Sale.find({})
            .populate('cliente', 'nombre apellidoP apellidoM codigo_cliente')
            .populate('vendedor', 'username email')
            .populate('productos.producto', 'codigo_producto nombre_producto')
            .sort({ createdAt: -1 });

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ventas', error: error.message });
    }
};

// @desc    Obtener una venta por ID
// @route   GET /api/sales/:id
// @access  Private
export const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('cliente', 'nombre apellidoP apellidoM codigo_cliente')
            .populate('vendedor', 'username email')
            .populate('productos.producto', 'codigo_producto nombre_producto');

        if (sale) {
            res.json(sale);
        } else {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener venta', error: error.message });
    }
};

// @desc    Crear una nueva venta (Sin transacciones para desarrollo)
// @route   POST /api/sales
// @access  Private
export const createSale = async (req, res) => {
    try {
        const {
            codigo_venta,
            cliente,
            productos,
            metodo_pago
        } = req.body;

        console.log('📦 Datos recibidos para crear venta:', {
            codigo_venta,
            cliente,
            productos: productos?.length,
            metodo_pago,
            vendedor: req.user?._id
        });

        // Verificar si el código ya existe
        const existingSale = await Sale.findOne({ codigo_venta });
        if (existingSale) {
            return res.status(400).json({ message: 'El código de venta ya existe' });
        }

        // Validar que tengamos productos
        if (!productos || productos.length === 0) {
            return res.status(400).json({ message: 'La venta debe incluir al menos un producto' });
        }

        // Calcular total y validar productos
        let total_general = 0;
        const productosProcessed = [];
        const productUpdates = []; // Para almacenar las actualizaciones de stock

        // Primero validamos todo antes de hacer cambios
        for (const item of productos) {
            if (!item.producto || !item.cantidad || item.cantidad <= 0) {
                return res.status(400).json({
                    message: 'Cada producto debe tener un ID válido y cantidad mayor a 0'
                });
            }

            const product = await Product.findById(item.producto);

            if (!product) {
                return res.status(404).json({
                    message: `Producto con ID ${item.producto} no encontrado`
                });
            }

            if (product.stock_actual < item.cantidad) {
                return res.status(400).json({
                    message: `Stock insuficiente para ${product.nombre_producto}. Disponible: ${product.stock_actual}, Solicitado: ${item.cantidad}`
                });
            }

            // Usar el precio del producto o el precio enviado
            const precio_unitario = item.precio_unitario || product.precio;
            const subtotal = precio_unitario * item.cantidad;
            total_general += subtotal;

            productosProcessed.push({
                producto: item.producto,
                cantidad: item.cantidad,
                precio_unitario: precio_unitario,
                subtotal: subtotal
            });

            // Preparar actualización de stock
            productUpdates.push({
                productId: item.producto,
                newStock: product.stock_actual - item.cantidad
            });
        }

        console.log('💰 Total calculado:', total_general);
        console.log('📋 Productos procesados:', productosProcessed.length);

        // Crear la venta
        const saleData = {
            codigo_venta,
            cliente: cliente || null,
            vendedor: req.user._id,
            productos: productosProcessed,
            total_general,
            metodo_pago,
            fecha_hora: new Date(),
            estado_venta: 'completada'
        };

        const sale = new Sale(saleData);
        const createdSale = await sale.save();

        console.log('✅ Venta creada:', createdSale._id);

        // Actualizar stock de productos (sin transacciones)
        for (const update of productUpdates) {
            try {
                await Product.findByIdAndUpdate(
                    update.productId,
                    { stock_actual: update.newStock },
                    { new: true }
                );
                console.log(`📦 Stock actualizado para producto ${update.productId}: ${update.newStock}`);
            } catch (stockError) {
                console.error(`❌ Error actualizando stock del producto ${update.productId}:`, stockError);
                // En producción, aquí podrías implementar un sistema de compensación
                // Por ahora, registramos el error pero no fallamos la venta
            }
        }

        // Obtener la venta con los datos poblados
        const populatedSale = await Sale.findById(createdSale._id)
            .populate('cliente', 'nombre apellidoP apellidoM codigo_cliente')
            .populate('vendedor', 'username email')
            .populate('productos.producto', 'codigo_producto nombre_producto');

        console.log('🎉 Venta completada exitosamente');

        res.status(201).json(populatedSale);

    } catch (error) {
        console.error('❌ Error al crear venta:', error);
        res.status(500).json({
            message: 'Error al crear venta',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Actualizar estado de una venta (Sin transacciones)
// @route   PUT /api/sales/:id/status
// @access  Private
export const updateSaleStatus = async (req, res) => {
    try {
        const { estado_venta } = req.body;

        if (!estado_venta || !['completada', 'cancelada', 'pendiente'].includes(estado_venta)) {
            return res.status(400).json({ message: 'Estado de venta inválido' });
        }

        const sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const oldStatus = sale.estado_venta;

        // Si se está cancelando una venta completada, restaurar stock
        if (oldStatus === 'completada' && estado_venta === 'cancelada') {
            for (const item of sale.productos) {
                try {
                    const product = await Product.findById(item.producto);
                    if (product) {
                        product.stock_actual += item.cantidad;
                        await product.save();
                        console.log(`📦 Stock restaurado para ${product.nombre_producto}: +${item.cantidad}`);
                    }
                } catch (stockError) {
                    console.error(`❌ Error restaurando stock para producto ${item.producto}:`, stockError);
                }
            }
        }

        // Si se está completando una venta cancelada, reducir stock
        if (oldStatus === 'cancelada' && estado_venta === 'completada') {
            for (const item of sale.productos) {
                const product = await Product.findById(item.producto);
                if (product) {
                    if (product.stock_actual < item.cantidad) {
                        return res.status(400).json({
                            message: `Stock insuficiente para ${product.nombre_producto}. Disponible: ${product.stock_actual}, Necesario: ${item.cantidad}`
                        });
                    }
                    product.stock_actual -= item.cantidad;
                    await product.save();
                    console.log(`📦 Stock reducido para ${product.nombre_producto}: -${item.cantidad}`);
                }
            }
        }

        sale.estado_venta = estado_venta;
        const updatedSale = await sale.save();

        console.log(`🔄 Estado de venta actualizado: ${oldStatus} → ${estado_venta}`);

        res.json(updatedSale);

    } catch (error) {
        console.error('❌ Error al actualizar estado de venta:', error);
        res.status(500).json({
            message: 'Error al actualizar estado de venta',
            error: error.message
        });
    }
};

// @desc    Obtener ventas por rango de fechas
// @route   GET /api/sales/by-date
// @access  Private
export const getSalesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Se requieren fechas de inicio y fin' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const sales = await Sale.find({
            fecha_hora: { $gte: start, $lte: end },
            estado_venta: 'completada'
        })
            .populate('cliente', 'nombre apellidoP apellidoM codigo_cliente')
            .populate('vendedor', 'username email')
            .populate('productos.producto', 'codigo_producto nombre_producto')
            .sort({ fecha_hora: -1 });

        const totalVentas = sales.length;
        const totalIngresos = sales.reduce((sum, sale) => sum + sale.total_general, 0);
        const productosMasVendidos = await getTopSellingProducts(start, end);

        res.json({
            sales,
            stats: {
                totalVentas,
                totalIngresos,
                productosMasVendidos
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ventas por fecha', error: error.message });
    }
};

// @desc    Obtener productos optimizados para POS
// @route   GET /api/sales/pos/products
// @access  Private
export const getProductsForPOS = async (req, res) => {
    try {
        const products = await Product.find({
            stock_actual: { $gt: 0 }
        })
            .select('codigo_producto nombre_producto precio stock_actual categoria descripcion')
            .sort({ nombre_producto: 1 });

        const customers = await Customer.find({})
            .select('codigo_cliente nombre apellidoP apellidoM email telefono')
            .sort({ nombre: 1 });

        res.json({
            products,
            customers,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos para POS', error: error.message });
    }
};

// @desc    Validar stock antes de agregar al carrito
// @route   POST /api/sales/pos/validate-stock
// @access  Private
export const validateStock = async (req, res) => {
    try {
        const { productos } = req.body;

        if (!productos || !Array.isArray(productos)) {
            return res.status(400).json({ message: 'Lista de productos requerida' });
        }

        const stockValidation = [];

        for (const item of productos) {
            const product = await Product.findById(item.producto);

            if (!product) {
                stockValidation.push({
                    productId: item.producto,
                    valid: false,
                    error: 'Producto no encontrado',
                    available: 0,
                    requested: item.cantidad
                });
                continue;
            }

            const isValid = product.stock_actual >= item.cantidad;
            stockValidation.push({
                productId: item.producto,
                productName: product.nombre_producto,
                valid: isValid,
                available: product.stock_actual,
                requested: item.cantidad,
                error: isValid ? null : 'Stock insuficiente'
            });
        }

        const allValid = stockValidation.every(item => item.valid);

        res.json({
            valid: allValid,
            validations: stockValidation,
            message: allValid ? 'Stock disponible' : 'Algunos productos no tienen stock suficiente'
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al validar stock', error: error.message });
    }
};

// @desc    Obtener estadísticas rápidas para dashboard POS
// @route   GET /api/sales/quick-stats
// @access  Private
export const getQuickStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySales = await Sale.find({
            fecha_hora: { $gte: today, $lt: tomorrow },
            estado_venta: 'completada'
        });

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlySales = await Sale.find({
            fecha_hora: { $gte: startOfMonth },
            estado_venta: 'completada'
        });

        const lowStockProducts = await Product.find({
            stock_actual: { $lt: 10, $gt: 0 }
        }).select('codigo_producto nombre_producto stock_actual');

        const outOfStockProducts = await Product.find({
            stock_actual: 0
        }).select('codigo_producto nombre_producto');

        const stats = {
            today: {
                sales: todaySales.length,
                revenue: todaySales.reduce((sum, sale) => sum + sale.total_general, 0)
            },
            month: {
                sales: monthlySales.length,
                revenue: monthlySales.reduce((sum, sale) => sum + sale.total_general, 0)
            },
            inventory: {
                lowStock: lowStockProducts.length,
                outOfStock: outOfStockProducts.length,
                lowStockProducts: lowStockProducts.slice(0, 5),
                outOfStockProducts: outOfStockProducts.slice(0, 5)
            },
            lastUpdate: new Date().toISOString()
        };

        res.json(stats);

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
};

// Función auxiliar para obtener productos más vendidos
const getTopSellingProducts = async (startDate, endDate) => {
    try {
        const topProducts = await Sale.aggregate([
            {
                $match: {
                    fecha_hora: { $gte: startDate, $lte: endDate },
                    estado_venta: 'completada'
                }
            },
            { $unwind: '$productos' },
            {
                $group: {
                    _id: '$productos.producto',
                    totalVendido: { $sum: '$productos.cantidad' },
                    totalIngresos: { $sum: '$productos.subtotal' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'producto'
                }
            },
            { $unwind: '$producto' },
            {
                $project: {
                    _id: 1,
                    codigo_producto: '$producto.codigo_producto',
                    nombre_producto: '$producto.nombre_producto',
                    totalVendido: 1,
                    totalIngresos: 1
                }
            },
            { $sort: { totalVendido: -1 } },
            { $limit: 10 }
        ]);

        return topProducts;
    } catch (error) {
        console.error('Error al obtener productos más vendidos:', error);
        return [];
    }
};