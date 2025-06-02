import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    searchProducts,
    getLowStockProducts
} from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getProducts)
    .post(protect, admin, createProduct);

router.get('/search', protect, searchProducts);
router.get('/low-stock', protect, getLowStockProducts);

router.route('/:id')
    .get(protect, getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

router.put('/:id/stock', protect, updateStock);

export default router;