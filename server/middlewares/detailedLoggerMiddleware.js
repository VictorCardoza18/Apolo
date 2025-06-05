// Middleware de registro detallado para ambiente de desarrollo
const detailedLogger = (req, res, next) => {
    const start = Date.now();

    // Registrar detalles de la petición entrante
    console.log('\n----------------------------------------');
    console.log(`📥 PETICIÓN RECIBIDA: ${new Date().toISOString()}`);
    console.log(`🔹 Método: ${req.method}`);
    console.log(`🔹 Ruta: ${req.originalUrl || req.url}`);
    console.log(`🔹 IP: ${req.ip}`);

    // Registrar headers (opcional)
    if (process.env.NODE_ENV === 'development') {
        console.log('🔹 Headers:', JSON.stringify(req.headers, null, 2));
    }

    // Registrar cuerpo de la petición si existe y no es una petición GET
    if (req.body && Object.keys(req.body).length > 0 && req.method !== 'GET') {
        // Ocultamos información sensible como contraseñas
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '********';

        console.log('🔹 Body:', JSON.stringify(sanitizedBody, null, 2));
    }

    // Interceptar el método de envío para registrar la respuesta
    const originalSend = res.send;
    res.send = function (body) {
        const duration = Date.now() - start;

        console.log('📤 RESPUESTA ENVIADA:');
        console.log(`🔹 Estado: ${res.statusCode} ${getStatusText(res.statusCode)}`);
        console.log(`🔹 Duración: ${duration}ms`);

        // Registrar cuerpo de respuesta (limitado en tamaño para evitar logs enormes)
        try {
            let responseBody = JSON.parse(body);
            if (responseBody) {
                // Limitar el tamaño de la respuesta en el log
                const stringBody = JSON.stringify(responseBody, null, 2);
                console.log(`🔹 Respuesta: ${stringBody.substring(0, 500)}${stringBody.length > 500 ? '...(truncado)' : ''}`);
            }
        } catch (e) {
            // Si no es JSON o hay error al parsearlo, mostrar un fragmento
            if (typeof body === 'string') {
                console.log(`🔹 Respuesta: ${body.substring(0, 100)}${body.length > 100 ? '...(truncado)' : ''}`);
            }
        }

        console.log('----------------------------------------\n');

        // Llamar al método original
        return originalSend.call(this, body);
    };

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

export default detailedLogger;