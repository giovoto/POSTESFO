import express from 'express';
import {
    generatePDFReport,
    generateExcelReport,
    getStatistics
} from '../controllers/reportesController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';

const router = express.Router();

/**
 * Rutas de reportes
 * Requieren autenticación y rol admin o supervisor
 */

// GET /api/reportes/pdf - Generar reporte PDF
router.get(
    '/pdf',
    authenticate,
    authorize('admin', 'supervisor'),
    generatePDFReport
);

// GET /api/reportes/excel - Generar reporte Excel
router.get(
    '/excel',
    authenticate,
    authorize('admin', 'supervisor'),
    generateExcelReport
);

// GET /api/reportes/stats - Obtener estadísticas
router.get(
    '/stats',
    authenticate,
    authorize('admin', 'supervisor'),
    getStatistics
);

export default router;
