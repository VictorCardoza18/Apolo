import express from 'express';
import {
    getSales,
    getSaleById,
    createSale,
    updateSaleStatus,
    getSalesByDateRange
} from '../controllers/saleController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getSales)
    .post(protect, createSale);

router.get('/by-date', protect, getSalesByDateRange);

router.route('/:id')
    .get(protect, getSaleById);

router.put('/:id/status', protect, updateSaleStatus);

export default router;