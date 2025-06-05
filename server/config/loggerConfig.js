import logger from '../middlewares/loggerMiddleware.js';
import detailedLogger from '../middlewares/detailedLoggerMiddleware.js';

// Configuración de registro según el entorno
export default function configureLogger(app) {
    // En producción, usamos el logger básico que solo muestra método, ruta y estado
    if (process.env.NODE_ENV === 'production') {
        app.use(logger);
        console.log('📝 Logs básicos activados (modo producción)');
    }
    // En desarrollo, usamos el logger detallado con cuerpos de petición y respuesta
    else {
        app.use(detailedLogger);
        console.log('📝 Logs detallados activados (modo desarrollo)');
    }
}