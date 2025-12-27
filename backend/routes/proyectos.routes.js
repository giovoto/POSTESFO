import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';
import {
    getAll,
    getById,
    create,
    update,
    deleteProyecto,
    getUsers,
    assignUser,
    removeUser,
    getStats
} from '../controllers/proyectosController.js';

const router = express.Router();

// Rutas públicas para usuarios autenticados
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.get('/:id/users', authenticate, getUsers);
router.get('/:id/stats', authenticate, getStats);

// Rutas solo para administradores
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), deleteProyecto);
router.post('/:id/users', authenticate, authorize('admin'), assignUser);
router.delete('/:id/users/:userId', authenticate, authorize('admin'), removeUser);

export default router;
