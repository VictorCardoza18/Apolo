import express from 'express';
import {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierProducts,
    searchSuppliers
} from '../controllers/supplierController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getSuppliers)
    .post(protect, admin, createSupplier);

router.get('/search', protect, searchSuppliers);

router.route('/:id')
    .get(protect, getSupplierById)
    .put(protect, admin, updateSupplier)
    .delete(protect, admin, deleteSupplier);

router.get('/:id/products', protect, getSupplierProducts);

export default router;