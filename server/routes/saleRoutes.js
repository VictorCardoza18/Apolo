import express from 'express';
import {
    getSales,
    getSaleById,
    createSale,
    updateSaleStatus,
    getSalesByDateRange,
    // Nuevas funciones para POS
    getProductsForPOS,
    validateStock,
    getQuickStats
} from '../controllers/saleController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas principales de ventas
router.route('/')
    .get(protect, getSales)
    .post(protect, createSale);

// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/by-date', protect, getSalesByDateRange);
router.get('/quick-stats', protect, getQuickStats);

// Rutas para POS
router.get('/pos/products', protect, getProductsForPOS);
router.post('/pos/validate-stock', protect, validateStock);

// Rutas con parámetros
router.route('/:id')
    .get(protect, getSaleById);

router.put('/:id/status', protect, updateSaleStatus);

export default router;