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
app.use((req, res, next) => {
    // Manually set CORS headers for serverless preflight
    const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173', 'https://postes-frontend.vercel.app'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Fallback permissive
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// app.use(cors(...)); // Replaced by manual middleware for full control
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
    res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// ✅ Health check mejorado (Database Test & Auto-Init)
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

app.get('/api/health', async (req, res) => {
    // 🛠️ HACK: Permitir inicializar la DB desde la URL
    if (req.query.schema === 'init') {
        try {
            console.log("🚀 Initializing schema via HTTP request...");

            // 1. Crear ENUMs
            await pool.query("DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'tecnico'); EXCEPTION WHEN duplicate_object THEN null; END $$;");
            await pool.query("DO $$ BEGIN CREATE TYPE foto_tipo AS ENUM ('panoramica', 'detalle'); EXCEPTION WHEN duplicate_object THEN null; END $$;");

            // 2. Crear Tablas
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    nombre VARCHAR(255) NOT NULL,
                    rol user_role NOT NULL DEFAULT 'tecnico',
                    activo BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // 3. Crear Postes & Fotos & Proyectos
            await pool.query(`
                CREATE TABLE IF NOT EXISTS postes (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    nombre VARCHAR(255) NOT NULL,
                    direccion TEXT,
                    latitud DECIMAL(10, 8) NOT NULL,
                    longitud DECIMAL(11, 8) NOT NULL,
                    estado VARCHAR(100),
                    tipo_mantenimiento VARCHAR(100),
                    numero_serie VARCHAR(100),
                    altura DECIMAL(5, 2),
                    material VARCHAR(100),
                    observaciones TEXT,
                    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await pool.query(`
                 CREATE TABLE IF NOT EXISTS fotos (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    poste_id UUID REFERENCES postes(id) ON DELETE CASCADE,
                    tipo foto_tipo NOT NULL,
                    url TEXT NOT NULL,
                    thumbnail_url TEXT,
                    filename VARCHAR(255),
                    size INTEGER,
                    metadata JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                  );
            `);

            // 4. Crear Admin User
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(`
                INSERT INTO users (email, password_hash, nombre, rol)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO NOTHING;
            `, ['admin@fiberoptic.com', hashedPassword, 'Administrador', 'admin']);

            return res.json({ status: 'OK', message: 'Schema initialized & Admin created!' });
        } catch (error) {
            console.error("Init Error:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    try {
        await pool.query('SELECT NOW()');
        res.json({
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV
        });
    } catch (error) {
        console.error('Health Check DB Error:', error);
        res.status(500).json({
            status: 'Error',
            database: 'Disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 🔥 TODAS LAS RUTAS DEBEN EMPEZAR CON /api
app.use('/api/auth', authRoutes);
app.use('/api/postes', postesRoutes);
app.use('/api', fotosRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/proyectos', proyectosRoutes);

// ❌ NO app.listen()
// ❌ NO ruta '/'

app.use(errorHandler);

export default app;
