import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';

// @desc    Obtener todos los proveedores
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({});
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedores', error: error.message });
    }
};

// @desc    Obtener un proveedor por ID
// @route   GET /api/suppliers/:id
// @access  Private
export const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (supplier) {
            res.json(supplier);
        } else {
            res.status(404).json({ message: 'Proveedor no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedor', error: error.message });
    }
};

// @desc    Crear un nuevo proveedor
// @route   POST /api/suppliers
// @access  Private/Admin
export const createSupplier = async (req, res) => {
    try {
        const {
            codigo_proveedor,
            nombre_proveedor,
            telefono,
            direccion,
            correo_electronico
        } = req.body;

        // Verificar si el código ya existe
        const existingSupplier = await Supplier.findOne({ codigo_proveedor });
        if (existingSupplier) {
            return res.status(400).json({ message: 'El código de proveedor ya existe' });
        }

        const supplier = await Supplier.create({
            codigo_proveedor,
            nombre_proveedor,
            telefono,
            direccion,
            correo_electronico
        });

        if (supplier) {
            res.status(201).json(supplier);
        } else {
            res.status(400).json({ message: 'Datos de proveedor inválidos' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al crear proveedor', error: error.message });
    }
};

// @desc    Actualizar un proveedor
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
export const updateSupplier = async (req, res) => {
    try {
        const {
            codigo_proveedor,
            nombre_proveedor,
            telefono,
            direccion,
            correo_electronico,
            estado_proveedor
        } = req.body;

        const supplier = await Supplier.findById(req.params.id);

        if (supplier) {
            // Si se está cambiando el código, verificar que no exista
            if (codigo_proveedor && codigo_proveedor !== supplier.codigo_proveedor) {
                const existingSupplier = await Supplier.findOne({ codigo_proveedor });
                if (existingSupplier) {
                    return res.status(400).json({ message: 'El código de proveedor ya existe' });
                }
                supplier.codigo_proveedor = codigo_proveedor;
            }

            supplier.nombre_proveedor = nombre_proveedor || supplier.nombre_proveedor;
            supplier.telefono = telefono || supplier.telefono;
            supplier.direccion = direccion || supplier.direccion;
            supplier.correo_electronico = correo_electronico || supplier.correo_electronico;

            // Solo actualizar estado si se proporciona explícitamente
            if (estado_proveedor !== undefined) {
                supplier.estado_proveedor = estado_proveedor;
            }

            const updatedSupplier = await supplier.save();
            res.json(updatedSupplier);
        } else {
            res.status(404).json({ message: 'Proveedor no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar proveedor', error: error.message });
    }
};

// @desc    Eliminar un proveedor (cambiar estado a inactivo)
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
export const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (supplier) {
            supplier.estado_proveedor = false;
            await supplier.save();
            res.json({ message: 'Proveedor desactivado' });
        } else {
            res.status(404).json({ message: 'Proveedor no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar proveedor', error: error.message });
    }
};

// @desc    Obtener productos de un proveedor
// @route   GET /api/suppliers/:id/products
// @access  Private
export const getSupplierProducts = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        const products = await Product.find({ codigo_proveedor: supplier.codigo_proveedor });

        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener productos del proveedor',
            error: error.message
        });
    }
};

// @desc    Buscar proveedores
// @route   GET /api/suppliers/search
// @access  Private
export const searchSuppliers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        }

        const suppliers = await Supplier.find({
            $or: [
                { codigo_proveedor: { $regex: query, $options: 'i' } },
                { nombre_proveedor: { $regex: query, $options: 'i' } },
                { correo_electronico: { $regex: query, $options: 'i' } }
            ],
            estado_proveedor: true // Solo proveedores activos
        });

        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar proveedores', error: error.message });
    }
};