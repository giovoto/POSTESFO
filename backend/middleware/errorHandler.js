/**
 * Custom Error Class
 */
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Si es un error operacional conocido, no loguear stack trace en producción
    if (!err.isOperational) {
        console.error('❌ Error:', err.stack || err);
    }

    if (res.headersSent) {
        return next(err);
    }

    // Default error status and message
    let status = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';

    // Handle specific database errors (PostgreSQL)
    if (err.code === '23505') { // Unique violation
        status = 409;
        message = 'El registro ya existe (duplicado)';
    } else if (err.code === '23503') { // Foreign key violation
        status = 400;
        message = 'Referencia inválida a otro registro';
    } else if (err.name === 'JsonWebTokenError') {
        status = 401;
        message = 'Token inválido. Por favor inicie sesión de nuevo.';
    } else if (err.name === 'TokenExpiredError') {
        status = 401;
        message = 'Su sesión ha expirado. Por favor inicie sesión de nuevo.';
    }

    res.status(status).json({
        status: err.status || 'error',
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack, code: err.code })
    });
};
