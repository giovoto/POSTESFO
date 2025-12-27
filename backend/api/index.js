import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import authRoutes from '../routes/auth.routes.js';
import postesRoutes from '../routes/postes.routes.js';
import fotosRoutes from '../routes/fotos.routes.js';
import usersRoutes from '../routes/users.routes.js';
import reportesRoutes from '../routes/reportes.routes.js';
import proyectosRoutes from '../routes/proyectos.routes.js';
import { errorHandler } from '../middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 TODAS LAS RUTAS DEBEN EMPEZAR CON /api
app.use('/api/auth', authRoutes);
app.use('/api/postes', postesRoutes);
app.use('/api', fotosRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/proyectos', proyectosRoutes);

// ✅ Health check (IMPORTANTE)
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ❌ NO app.listen()
// ❌ NO ruta '/'

export default app;
