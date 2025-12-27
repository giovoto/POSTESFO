/**
 * Validation Middleware
 * Validates request body fields
 */

export const validateResult = (req, res, next) => {
    // Simple validation logic can be expanded
    // This is a placeholder for where express-validator would hook in
    // or custom logic
    next();
};

export const requireFields = (fields) => {
    return (req, res, next) => {
        const missing = [];
        fields.forEach(field => {
            if (!req.body[field]) {
                missing.push(field);
            }
        });

        if (missing.length > 0) {
            return res.status(400).json({
                error: `Faltan campos requeridos: ${missing.join(', ')}`
            });
        }
        next();
    };
};
