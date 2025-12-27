/**
 * Middleware de autorización por roles
 * Verifica que el usuario tenga el rol necesario
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'No autorizado.'
            });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                error: 'No tienes permisos para realizar esta acción.'
            });
        }

        next();
    };
};
