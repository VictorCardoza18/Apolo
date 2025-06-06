import express from 'express';
import {
    getSalesPrediction,
    getInventoryRecommendationsHandler,
    getCustomerPatterns,
    getDashboardInsights,
    getProductPerformanceAnalysis,
    getSeasonalTrends,
    getRiskAnalysis,
    generateBusinessReport
} from '../controllers/aiController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// === RUTAS PRINCIPALES DE AI ===

// Dashboard insights - Para el dashboard principal
router.get('/dashboard-insights', protect, getDashboardInsights);

// Predicciones de ventas - Solo admins
router.get('/sales-prediction', protect, admin, getSalesPrediction);

// Recomendaciones de inventario - Todos los usuarios pueden ver alertas
router.get('/inventory-recommendations', protect, getInventoryRecommendationsHandler);

// Análisis de patrones de clientes
router.get('/customer-patterns', protect, getCustomerPatterns);
router.get('/customer-patterns/:id', protect, getCustomerPatterns);

// === RUTAS ADICIONALES PARA ANÁLISIS AVANZADO ===

// Análisis de rendimiento de productos - Solo admins
router.get('/product-performance', protect, admin, getProductPerformanceAnalysis);

// Tendencias estacionales - Solo admins
router.get('/seasonal-trends', protect, admin, getSeasonalTrends);

// Análisis de riesgos - Solo admins
router.get('/risk-analysis', protect, admin, getRiskAnalysis);

// Generar reporte de negocio completo - Solo admins
router.post('/business-report', protect, admin, generateBusinessReport);

export default router;