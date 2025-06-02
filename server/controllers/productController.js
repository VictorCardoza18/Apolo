import Product from '../models/Product.js';

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener producto', error: error.message });
    }
};

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const {
            codigo_producto,
            nombre_producto,
            descripcion_producto,
            codigo_proveedor,
            precio,
            stock_minimo,
            stock_actual,
            unidad_medida,
            categoria_producto
        } = req.body;

        // Verificar si el código ya existe
        const existingProduct = await Product.findOne({ codigo_producto });
        if (existingProduct) {
            return res.status(400).json({ message: 'El código de producto ya existe' });
        }

        const product = await Product.create({
            codigo_producto,
            nombre_producto,
            descripcion_producto,
            codigo_proveedor,
            precio,
            stock_minimo,
            stock_actual,
            unidad_medida,
            categoria_producto
        });

        if (product) {
            res.status(201).json(product);
        } else {
            res.status(400).json({ message: 'Datos de producto inválidos' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
};

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const {
            codigo_producto,
            nombre_producto,
            descripcion_producto,
            codigo_proveedor,
            precio,
            stock_minimo,
            stock_actual,
            unidad_medida,
            categoria_producto
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            // Si se está cambiando el código, verificar que no exista
            if (codigo_producto && codigo_producto !== product.codigo_producto) {
                const existingProduct = await Product.findOne({ codigo_producto });
                if (existingProduct) {
                    return res.status(400).json({ message: 'El código de producto ya existe' });
                }
                product.codigo_producto = codigo_producto;
            }

            product.nombre_producto = nombre_producto || product.nombre_producto;
            product.descripcion_producto = descripcion_producto || product.descripcion_producto;
            product.codigo_proveedor = codigo_proveedor || product.codigo_proveedor;

            if (precio !== undefined) {
                product.precio = precio;
            }

            if (stock_minimo !== undefined) {
                product.stock_minimo = stock_minimo;
            }

            if (stock_actual !== undefined) {
                product.stock_actual = stock_actual;
            }

            product.unidad_medida = unidad_medida || product.unidad_medida;
            product.categoria_producto = categoria_producto || product.categoria_producto;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
};

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Producto eliminado' });
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
};

// @desc    Actualizar stock de producto
// @route   PUT /api/products/:id/stock
// @access  Private
export const updateStock = async (req, res) => {
    try {
        const { stock_actual } = req.body;

        if (stock_actual === undefined) {
            return res.status(400).json({ message: 'Se requiere el stock actual' });
        }

        const product = await Product.findById(req.params.id);

        if (product) {
            product.stock_actual = stock_actual;
            const updatedProduct = await product.save();

            // Verificar si el stock está por debajo del mínimo
            if (updatedProduct.stock_actual < updatedProduct.stock_minimo) {
                // Aquí podríamos implementar un sistema de alertas
                console.log(`¡Alerta! El producto ${updatedProduct.nombre_producto} está por debajo del stock mínimo`);
            }

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar stock', error: error.message });
    }
};

// @desc    Buscar productos
// @route   GET /api/products/search
// @access  Private
export const searchProducts = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        }

        const products = await Product.find({
            $or: [
                { codigo_producto: { $regex: query, $options: 'i' } },
                { nombre_producto: { $regex: query, $options: 'i' } },
                { descripcion_producto: { $regex: query, $options: 'i' } },
                { categoria_producto: { $regex: query, $options: 'i' } }
            ]
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar productos', error: error.message });
    }
};

// @desc    Obtener productos con stock bajo
// @route   GET /api/products/low-stock
// @access  Private
export const getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ["$stock_actual", "$stock_minimo"] }
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos con stock bajo', error: error.message });
    }
};