import express from 'express';
import { login, register, getMe, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';

const router = express.Router();

/**
 * Rutas de autenticación
 */

// POST /api/auth/login - Login de usuario
router.post('/login', login);

// POST /api/auth/register - Registro de usuario (solo admin)
router.post('/register', authenticate, authorize('admin'), register);

// GET /api/auth/me - Obtener usuario actual
router.get('/me', authenticate, getMe);

// POST /api/auth/logout - Logout
router.post('/logout', authenticate, logout);

export default router;
