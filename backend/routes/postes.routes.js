import express from 'express';
import {
    createPoste,
    getPosteById,
    getPostes,
    getNearbyPostes,
    updatePoste,
    deletePoste
} from '../controllers/postesController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';

const router = express.Router();

/**
 * Rutas de postes
 * Todas requieren autenticación
 */

// GET /api/postes - Listar postes con filtros
router.get('/', authenticate, getPostes);

// GET /api/postes/nearby - Buscar postes cercanos
router.get('/nearby', authenticate, getNearbyPostes);

// GET /api/postes/:id - Obtener poste específico
router.get('/:id', authenticate, getPosteById);

// POST /api/postes - Crear nuevo poste
router.post('/', authenticate, createPoste);

// PUT /api/postes/:id - Actualizar poste
router.put('/:id', authenticate, updatePoste);

// DELETE /api/postes/:id - Eliminar poste (solo admin)
router.delete('/:id', authenticate, authorize('admin'), deletePoste);

export default router;
