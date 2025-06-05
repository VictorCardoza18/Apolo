// Logger Middleware para registrar peticiones HTTP
const logger = (req, res, next) => {
    // Guarda el tiempo de inicio para calcular la duración de la petición
    const start = Date.now();

    // Almacena el método de respuesta original
    const originalSend = res.send;

    // Sobrescribe el método send para capturar el código de estado
    res.send = function (body) {
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();

        // Formatea la URL para mostrar solo la ruta principal
        const path = req.originalUrl || req.url;

        // Imprime información de la petición con formato colorizado (para consolas que soporten colores)
        const statusCode = res.statusCode;
        let statusColor;

        // Asignar colores según el código de estado
        if (statusCode >= 500) {
            statusColor = '\x1b[31m%s\x1b[0m'; // Rojo para errores de servidor
        } else if (statusCode >= 400) {
            statusColor = '\x1b[33m%s\x1b[0m'; // Amarillo para errores de cliente
        } else if (statusCode >= 300) {
            statusColor = '\x1b[36m%s\x1b[0m'; // Cyan para redirecciones
        } else {
            statusColor = '\x1b[32m%s\x1b[0m'; // Verde para éxito
        }

        console.log(
            `[${timestamp}] ${req.method} ${path} - ` +
            statusColor,
            `${statusCode} ${getStatusText(statusCode)}`,
            `(${duration}ms)`
        );

        // Llama al método send original
        return originalSend.call(this, body);
    };

    // Continúa con la siguiente función en la cadena de middleware
    next();
};

// Función auxiliar para obtener el texto de estado HTTP según el código
function getStatusText(code) {
    const statusTexts = {
        200: 'OK',
        201: 'Created',
        204: 'No Content',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
        422: 'Unprocessable Entity',
        500: 'Internal Server Error'
    };

    return statusTexts[code] || 'Unknown';
}

export default logger;