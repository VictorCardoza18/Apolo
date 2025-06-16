import express from 'express';
import { processChatQuery, getChatHistory } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Procesar consulta de chat
router.post('/query', protect, processChatQuery);

// Obtener historial de chat
router.get('/history', protect, getChatHistory);

export default router;