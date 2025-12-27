import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import postesRoutes from './routes/postes.routes.js';
import fotosRoutes from './routes/fotos.routes.js';
import usersRoutes from './routes/users.routes.js';
import reportesRoutes from './routes/reportes.routes.js';
import proyectosRoutes from './routes/proyectos.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Configuración
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/postes', postesRoutes);
app.use('/api', fotosRoutes); // Incluye rutas de fotos
app.use('/api/users', usersRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/proyectos', proyectosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API de Sistema de Documentación de Postes - Fibra Óptica',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            postes: '/api/postes',
            fotos: '/api/postes/:id/fotos',
            users: '/api/users',
            proyectos: '/api/proyectos'
        }
    });
});

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Servidor iniciado exitosamente                      ║
║                                                           ║
║   📡 Puerto: ${PORT}                                      ║
║   🌍 Entorno: ${process.env.NODE_ENV || 'development'}   ║
║   📍 URL: http://localhost:${PORT}                        ║
║                                                           ║
║   📚 Documentación API:                                   ║
║      - Auth:      /api/auth                               ║
║      - Postes:    /api/postes                             ║
║      - Fotos:     /api/postes/:id/fotos                   ║
║      - Users:     /api/users                              ║
║      - Reportes:  /api/reportes                           ║
║      - Proyectos: /api/proyectos                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
