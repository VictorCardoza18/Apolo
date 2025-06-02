import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Obtener todas las ventas
// @route   GET /api/sales
// @access  Private
export const getSales = async (req, res) => {
    try {
        const sales = await Sale.find({})
            .populate('cliente', 'nombre apellidoP apellidoM codigo_cliente')
            .populate('vendedor', 'username email')
            .populate('productos.producto', 'codigo_producto nombre_producto');

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

// @desc    Crear una nueva venta
// @route   POST /api/sales
// @access  Private
export const createSale = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            codigo_venta,
            cliente,
            productos,
            metodo_pago
        } = req.body;

        // Verificar si el código ya existe
        const existingSale = await Sale.findOne({ codigo_venta });
        if (existingSale) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'El código de venta ya existe' });
        }

        // Calcular total y validar productos
        let total_general = 0;
        const productosProcessed = [];

        for (const item of productos) {
            const product = await Product.findById(item.producto).session(session);

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: `Producto ${item.producto} no encontrado` });
            }

            if (product.stock_actual < item.cantidad) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message: `Stock insuficiente para ${product.nombre_producto}. 
                   Disponible: ${product.stock_actual}, Solicitado: ${item.cantidad}`
                });
            }

            const subtotal = product.precio * item.cantidad;
            total_general += subtotal;

            // Actualizar stock
            product.stock_actual -= item.cantidad;
            await product.save({ session });

            productosProcessed.push({
                producto: item.producto,
                cantidad: item.cantidad,
                precio_unitario: product.precio,
                subtotal
            });
        }

        // Crear la venta
        const sale = new Sale({
            codigo_venta,
            cliente,
            vendedor: req.user._id, // Del middleware de auth
            productos: productosProcessed,
            total_general,
            metodo_pago,
            fecha_hora: new Date()
        });

        const createdSale = await sale.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Obtener la venta con los datos poblados
        const populatedSale = await Sale.findById(createdSale._id)
            .populate('cliente', 'nombre apellidoP apellidoM codigo_cliente')
            .populate('vendedor', 'username email')
            .populate('productos.producto', 'codigo_producto nombre_producto');

        res.status(201).json(populatedSale);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Error al crear venta', error: error.message });
    }
};

// @desc    Actualizar estado de una venta
// @route   PUT /api/sales/:id/status
// @access  Private
export const updateSaleStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { estado_venta } = req.body;

        if (!estado_venta || !['completada', 'cancelada', 'pendiente'].includes(estado_venta)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Estado de venta inválido' });
        }

        const sale = await Sale.findById(req.params.id).session(session);

        if (!sale) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const oldStatus = sale.estado_venta;

        // Si se está cancelando una venta completada, restaurar stock
        if (oldStatus === 'completada' && estado_venta === 'cancelada') {
            for (const item of sale.productos) {
                const product = await Product.findById(item.producto).session(session);
                if (product) {
                    product.stock_actual += item.cantidad;
                    await product.save({ session });
                }
            }
        }

        // Si se está completando una venta cancelada, reducir stock
        if (oldStatus === 'cancelada' && estado_venta === 'completada') {
            for (const item of sale.productos) {
                const product = await Product.findById(item.producto).session(session);
                if (product) {
                    if (product.stock_actual < item.cantidad) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            message: `Stock insuficiente para ${product.codigo_producto}. 
                       Disponible: ${product.stock_actual}, Necesario: ${item.cantidad}`
                        });
                    }
                    product.stock_actual -= item.cantidad;
                    await product.save({ session });
                }
            }
        }

        sale.estado_venta = estado_venta;
        const updatedSale = await sale.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json(updatedSale);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Error al actualizar estado de venta', error: error.message });
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
        end.setHours(23, 59, 59, 999); // Incluir todo el día final

        const sales = await Sale.find({
            fecha_hora: { $gte: start, $lte: end },
            estado_venta: 'completada'
        })
            .populate('cliente', 'nombre apellidoP apellidoM codigo_cliente')
            .populate('vendedor', 'username email')
            .populate('productos.producto', 'codigo_producto nombre_producto');

        // Calcular estadísticas
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

// Función auxiliar para obtener productos más vendidos
const getTopSellingProducts = async (startDate, endDate) => {
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
};