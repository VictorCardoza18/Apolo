import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { log } from 'console';

// Generar token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};

// @desc    Autenticar usuario & obtener token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const user = await User.findOne({ email });

        // Verificar usuario y contraseña
        if (user && (await bcrypt.compare(password, user.password))) {
            // Verificar si el usuario está activo
            if (!user.isActive) {
                return res.status(403).json({
                    message: 'Tu cuenta está inactiva. Contacta al administrador.'
                });
            }

            log('Usuario encontrado:', user);
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                isActive: user.isActive,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Email o contraseña incorrectos' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

// @desc    Obtener perfil de usuario
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
    }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
    }
};

// @desc    Solicitar restablecimiento de contraseña
// @route   POST /api/users/reset-password-request
// @access  Public
export const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar token de restablecimiento
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

        await user.save();

        // Aquí iría la lógica para enviar el email con el token
        // Por ahora solo devolvemos el token para probar
        res.json({ message: 'Se ha enviado un correo con instrucciones', resetToken });
    } catch (error) {
        res.status(500).json({ message: 'Error al solicitar restablecimiento', error: error.message });
    }
};

// ============== FUNCIONALIDADES CRUD PARA ADMINISTRADORES ==============

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

// @desc    Obtener usuario por ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
    }
};

// @desc    Crear nuevo usuario (Admin)
// @route   POST /api/users/create
// @access  Private/Admin
export const createUser = async (req, res) => {
    try {
        const { username, email, password, role, isAdmin, isActive } = req.body;

        // Validaciones
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Nombre de usuario, email y contraseña son requeridos'
            });
        }

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });

        if (userExists) {
            return res.status(400).json({
                message: 'Ya existe un usuario con ese email o nombre de usuario'
            });
        }

        // Hash de contraseña
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Sincronizar role e isAdmin
        const userRole = role || 'user';
        const userIsAdmin = isAdmin !== undefined ? isAdmin : (userRole === 'admin');

        // Crear usuario
        const user = await User.create({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: userRole,
            isAdmin: userIsAdmin,
            isActive: isActive !== undefined ? isActive : true
        });

        // Devolver usuario sin contraseña
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: userResponse
        });

    } catch (error) {
        if (error.code === 11000) {
            // Error de duplicado de MongoDB
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({
                message: `Ya existe un usuario con ese ${field === 'email' ? 'email' : 'nombre de usuario'}`
            });
        } else {
            res.status(500).json({
                message: 'Error al crear usuario',
                error: error.message
            });
        }
    }
};

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const { username, email, password, role, isAdmin, isActive } = req.body;

        // Verificar duplicados (excluyendo el usuario actual)
        if (email && email !== user.email) {
            const emailExists = await User.findOne({
                email: email,
                _id: { $ne: req.params.id }
            });
            if (emailExists) {
                return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
            }
        }

        if (username && username !== user.username) {
            const usernameExists = await User.findOne({
                username: username,
                _id: { $ne: req.params.id }
            });
            if (usernameExists) {
                return res.status(400).json({ message: 'Ya existe un usuario con ese nombre de usuario' });
            }
        }

        // Actualizar campos
        user.username = username || user.username;
        user.email = email || user.email;
        user.role = role || user.role;
        user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
        user.isActive = isActive !== undefined ? isActive : user.isActive;

        // Sincronizar role e isAdmin
        if (role === 'admin') {
            user.isAdmin = true;
        } else if (role === 'user') {
            user.isAdmin = false;
        }

        // Actualizar contraseña si se proporcionó
        if (password) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();

        // Devolver usuario sin contraseña
        const userResponse = {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            isAdmin: updatedUser.isAdmin,
            isActive: updatedUser.isActive,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };

        res.json({
            message: 'Usuario actualizado exitosamente',
            user: userResponse
        });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({
                message: `Ya existe un usuario con ese ${field === 'email' ? 'email' : 'nombre de usuario'}`
            });
        } else {
            res.status(500).json({
                message: 'Error al actualizar usuario',
                error: error.message
            });
        }
    }
};

// @desc    Eliminar/Desactivar usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Prevenir que un admin se elimine a sí mismo
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: 'No puedes desactivar tu propia cuenta'
            });
        }

        // En lugar de eliminar, desactivamos el usuario
        user.isActive = false;
        await user.save();

        res.json({
            message: 'Usuario desactivado exitosamente',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isActive: user.isActive
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al desactivar usuario',
            error: error.message
        });
    }
};

// @desc    Cambiar contraseña de usuario (Admin)
// @route   PUT /api/users/:id/password
// @access  Private/Admin
export const changeUserPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'La contraseña es requerida' });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Hash de nueva contraseña
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(password, salt);

        // Limpiar tokens de reset si existen
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({
            message: 'Contraseña actualizada exitosamente',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};

// @desc    Generar token de recuperación de contraseña (Admin)
// @route   POST /api/users/:id/reset-token
// @access  Private/Admin
export const generateResetToken = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar token de restablecimiento
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

        await user.save();

        res.json({
            message: 'Token de recuperación generado exitosamente',
            resetToken: resetToken,
            expiresAt: new Date(user.resetPasswordExpires),
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al generar token de recuperación',
            error: error.message
        });
    }
};

// @desc    Obtener estadísticas de usuarios (Admin)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        const adminUsers = await User.countDocuments({
            $or: [
                { role: 'admin' },
                { isAdmin: true }
            ]
        });

        // Usuarios registrados en los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers,
            adminUsers,
            recentUsers,
            userGrowth: {
                lastMonth: recentUsers
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

// @desc    Buscar usuarios
// @route   GET /api/users/search
// @access  Private/Admin
export const searchUsers = async (req, res) => {
    try {
        const { query, role, status, page = 1, limit = 10 } = req.query;

        // Construir filtros
        const filters = {};

        if (query) {
            filters.$or = [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }

        if (role && role !== 'all') {
            filters.role = role;
        }

        if (status && status !== 'all') {
            filters.isActive = status === 'active';
        }

        // Paginación
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const users = await User.find(filters)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        const total = await User.countDocuments(filters);
        const totalPages = Math.ceil(total / limitNumber);

        res.json({
            users,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalUsers: total,
                hasNext: pageNumber < totalPages,
                hasPrev: pageNumber > 1
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al buscar usuarios',
            error: error.message
        });
    }
};