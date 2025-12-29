import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        console.log("🚀 Initializing schema (Standalone Function)...");

        // 1. Crear ENUMs
        await pool.query("DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'tecnico'); EXCEPTION WHEN duplicate_object THEN null; END $$;");
        await pool.query("DO $$ BEGIN CREATE TYPE foto_tipo AS ENUM ('panoramica', 'detalle'); EXCEPTION WHEN duplicate_object THEN null; END $$;");

        // 2. Crear Tabla Users
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

        // 3. Crear Postes & Fotos
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

        // 4. Crear Proyectos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS proyectos (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                codigo VARCHAR(50) UNIQUE NOT NULL,
                ubicacion VARCHAR(255),
                fecha_inicio DATE,
                fecha_fin DATE,
                estado VARCHAR(50) DEFAULT 'activo',
                created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios_proyectos (
                proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
                usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
                rol_proyecto VARCHAR(50) DEFAULT 'miembro',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (proyecto_id, usuario_id)
            );
        `);

        // 5. Crear Admin User (Upsert + Verify)
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Insertar o Actualizar
        await pool.query(`
            INSERT INTO users (email, password_hash, nombre, rol, activo)
            VALUES ($1, $2, $3, $4, true)
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                nombre = EXCLUDED.nombre,
                rol = EXCLUDED.rol,
                activo = true;
        `, ['admin@fiberoptic.com', hashedPassword, 'Administrador', 'admin']);

        // Verificar que se creó
        const adminCheck = await pool.query("SELECT id, email, rol, activo FROM users WHERE email = 'admin@fiberoptic.com'");
        console.log("Admin User Check:", adminCheck.rows[0]);

        res.status(200).json({
            status: 'OK',
            message: 'Schema initialized & Admin created successfully!',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Init Error:", error);
        res.status(500).json({
            status: 'Error',
            error: error.message,
            debug: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                hasPostgresUrl: !!process.env.POSTGRES_URL,
                hasSupabaseUrl: !!process.env.SUPABASE_URL,
                postgresHost: process.env.POSTGRES_HOST || 'undefined',
                env: process.env.NODE_ENV
            },
            stack: error.stack
        });
    }
}
