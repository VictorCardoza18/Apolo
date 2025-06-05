import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token del header
            token = req.headers.authorization.split(' ')[1];

            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Obtener usuario del token
            req.user = await User.findById(decoded.id).select('-password');

            // Verificar que el usuario existe
            if (!req.user) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            // Verificar que el usuario esté activo
            if (!req.user.isActive) {
                return res.status(403).json({
                    message: 'Tu cuenta está inactiva. Contacta al administrador.'
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware protect:', error);

            // Diferentes tipos de errores JWT
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token inválido' });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado' });
            } else {
                return res.status(401).json({ message: 'No autorizado, token fallido' });
            }
        }
    } else {
        return res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

export const admin = (req, res, next) => {
    // Verificar que el usuario existe
    if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Verificar permisos de administrador (ambas propiedades para compatibilidad)
    const isAdmin = req.user.isAdmin || req.user.role === 'admin';

    if (isAdmin) {
        next();
    } else {
        res.status(403).json({
            message: 'Acceso denegado. Se requieren privilegios de administrador.'
        });
    }
};

// Middleware opcional: verificar que el usuario puede acceder a su propio recurso o es admin
export const ownerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const isOwner = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.isAdmin || req.user.role === 'admin';

    if (isOwner || isAdmin) {
        next();
    } else {
        res.status(403).json({
            message: 'Acceso denegado. Solo puedes acceder a tu propio perfil.'
        });
    }
};

// Middleware para verificar que el usuario está activo (útil para rutas específicas)
export const requireActive = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!req.user.isActive) {
        return res.status(403).json({
            message: 'Tu cuenta está inactiva. Contacta al administrador.'
        });
    }

    next();
};

// Middleware para logging de accesos (opcional)
export const logAccess = (req, res, next) => {
    if (req.user) {
        console.log(`[${new Date().toISOString()}] Usuario ${req.user.username} (${req.user.email}) accedió a ${req.method} ${req.originalUrl}`);
    }
    next();
};