import express from 'express';
import {
    uploadFoto,
    getFotosByPoste,
    deleteFoto
} from '../controllers/fotosController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * Rutas de fotos
 * Todas requieren autenticación
 */

// POST /api/postes/:id/fotos - Subir foto a un poste
router.post(
    '/postes/:id/fotos',
    authenticate,
    upload.single('foto'),
    uploadFoto
);

// GET /api/postes/:id/fotos - Obtener fotos de un poste
router.get('/postes/:id/fotos', authenticate, getFotosByPoste);

// DELETE /api/fotos/:id - Eliminar foto
router.delete('/fotos/:id', authenticate, deleteFoto);

export default router;
