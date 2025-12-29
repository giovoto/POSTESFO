import { verifyToken } from '../config/auth.js';

/**
 * Middleware de autenticación
 * Verifica que el usuario tenga un token JWT válido
 */
export const authenticate = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'No autorizado. Token no proporcionado.'
            });
        }

        const token = authHeader.substring(7); // Remover 'Bearer '

        // Verificar token
        const decoded = verifyToken(token);

        // Agregar información del usuario al request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            rol: decoded.rol
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        console.log('Token verification failed for:', req.headers.authorization?.substring(0, 20) + '...');
        return res.status(401).json({
            error: 'Token inválido o expirado.',
            debug: error.message
        });
    }
};
