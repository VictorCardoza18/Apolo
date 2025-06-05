import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './middlewares/loggerMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import configureLogger from './config/loggerConfig.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
configureLogger(app);

// Logger middleware - debe ir DESPUÉS de cors y express.json para registrar el cuerpo correcto,
// pero ANTES de las rutas para registrar todas las solicitudes
app.use(logger);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/ai', aiRoutes);

// Ruta inicial para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('API del Sistema de Punto de Venta funcionando correctamente');
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).send({ message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ ERROR:', err.stack);
    res.status(500).send({ message: 'Error en el servidor', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📝 Logs de peticiones HTTP activados`);
});

export default app;