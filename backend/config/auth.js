import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_default';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

console.log('JWT_SECRET configured:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'MISSING');

/**
 * Generar token JWT
 */
export const generateToken = (userId, email, rol) => {
    return jwt.sign(
        { userId, email, rol },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Verificar token JWT
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};
