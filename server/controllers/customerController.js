import Customer from '../models/Customer.js';

// @desc    Obtener todos los clientes
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
    }
};

// @desc    Obtener un cliente por ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cliente', error: error.message });
    }
};

// @desc    Crear un nuevo cliente
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res) => {
    try {
        const {
            codigo_cliente,
            nombre,
            apellidoP,
            apellidoM,
            telefono,
            direccion,
            razon_social,
            correo_electronico
        } = req.body;

        // Verificar si el código ya existe
        const existingCustomer = await Customer.findOne({ codigo_cliente });
        if (existingCustomer) {
            return res.status(400).json({ message: 'El código de cliente ya existe' });
        }

        const customer = await Customer.create({
            codigo_cliente,
            nombre,
            apellidoP,
            apellidoM,
            telefono,
            direccion,
            razon_social,
            correo_electronico
        });

        if (customer) {
            res.status(201).json(customer);
        } else {
            res.status(400).json({ message: 'Datos de cliente inválidos' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al crear cliente', error: error.message });
    }
};

// @desc    Actualizar un cliente
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
    try {
        const {
            codigo_cliente,
            nombre,
            apellidoP,
            apellidoM,
            telefono,
            direccion,
            razon_social,
            correo_electronico,
            estado_cliente
        } = req.body;

        const customer = await Customer.findById(req.params.id);

        if (customer) {
            // Si se está cambiando el código, verificar que no exista
            if (codigo_cliente && codigo_cliente !== customer.codigo_cliente) {
                const existingCustomer = await Customer.findOne({ codigo_cliente });
                if (existingCustomer) {
                    return res.status(400).json({ message: 'El código de cliente ya existe' });
                }
                customer.codigo_cliente = codigo_cliente;
            }

            customer.nombre = nombre || customer.nombre;
            customer.apellidoP = apellidoP || customer.apellidoP;
            customer.apellidoM = apellidoM || customer.apellidoM;
            customer.telefono = telefono || customer.telefono;
            customer.direccion = direccion || customer.direccion;
            customer.razon_social = razon_social || customer.razon_social;
            customer.correo_electronico = correo_electronico || customer.correo_electronico;

            // Solo actualizar estado_cliente si se proporciona explícitamente
            if (estado_cliente !== undefined) {
                customer.estado_cliente = estado_cliente;
            }

            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar cliente', error: error.message });
    }
};

// @desc    Eliminar un cliente (cambiar estado a inactivo)
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            customer.estado_cliente = false;
            await customer.save();
            res.json({ message: 'Cliente desactivado' });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar cliente', error: error.message });
    }
};

// @desc    Búsqueda de clientes
// @route   GET /api/customers/search
// @access  Private
export const searchCustomers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        }

        const customers = await Customer.find({
            $or: [
                { codigo_cliente: { $regex: query, $options: 'i' } },
                { nombre: { $regex: query, $options: 'i' } },
                { apellidoP: { $regex: query, $options: 'i' } },
                { apellidoM: { $regex: query, $options: 'i' } },
                { correo_electronico: { $regex: query, $options: 'i' } }
            ],
            estado_cliente: true // Solo clientes activos
        });

        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar clientes', error: error.message });
    }
};