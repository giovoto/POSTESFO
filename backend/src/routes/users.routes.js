import express from 'express';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/usersController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';

const router = express.Router();

/**
 * Rutas de usuarios (solo admin)
 */

// GET /api/users - Listar usuarios
router.get('/', authenticate, authorize('admin'), getUsers);

// POST /api/users - Crear usuario
router.post('/', authenticate, authorize('admin'), createUser);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', authenticate, authorize('admin'), updateUser);

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
