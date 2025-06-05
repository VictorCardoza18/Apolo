import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    resetPasswordRequest,
    // CRUD Admin functions
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    generateResetToken,
    getUserStats,
    searchUsers
} from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password-request', resetPasswordRequest);

// Rutas protegidas (usuario autenticado)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Rutas de administrador
router.get('/stats', protect, admin, getUserStats);
router.get('/search', protect, admin, searchUsers);
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUserById);
router.post('/create', protect, admin, createUser);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/password', protect, admin, changeUserPassword);
router.post('/:id/reset-token', protect, admin, generateResetToken);

export default router;