import express from 'express';
import {
    getSalesPrediction,
    getInventoryRecommendationsHandler,
    getCustomerPatterns
} from '../controllers/aiController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/sales-prediction', protect, admin, getSalesPrediction);
router.get('/inventory-recommendations', protect, getInventoryRecommendationsHandler);
router.get('/customer-patterns/:id', protect, getCustomerPatterns);

export default router;