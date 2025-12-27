import pg from 'pg';
import bcrypt from 'bcryptjs';

// URL de conexión extraída de tu mensaje
const CONNECTION_STRING = 'postgresql://neondb_owner:npg_KqU7TJxShjw1@ep-billowing-sunset-adekg75e-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { Pool } = pg;

const pool = new Pool({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false } // Importante para Neon
});

const migrate = async () => {
    const client = await pool.connect();
    console.log('🌍 Conectado a Neon Tech PostgreSQL');

    try {
        console.log('🚀 Iniciando migración a la nube...\n');

        // Crear tipo ENUM para roles
        console.log('👥 Creando tipos ENUM...');
        await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'tecnico');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        await client.query(`
      DO $$ BEGIN
        CREATE TYPE foto_tipo AS ENUM ('panoramica', 'detalle');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
        console.log('✅ Tipos ENUM creados\n');

        // Crear tabla de usuarios
        console.log('👤 Creando tabla users...');
        await client.query(`
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
        console.log('✅ Tabla users creada\n');

        // Crear tabla de postes
        console.log('📍 Creando tabla postes...');
        await client.query(`
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
        console.log('✅ Tabla postes creada\n');

        // Crear índices
        console.log('🗺️  Creando índices...');
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_postes_latitud ON postes(latitud);
      CREATE INDEX IF NOT EXISTS idx_postes_longitud ON postes(longitud);
      CREATE INDEX IF NOT EXISTS idx_postes_created_at ON postes(created_at DESC);
    `);
        console.log('✅ Índices creados\n');

        // Crear tabla de fotos
        console.log('📸 Creando tabla fotos...');
        await client.query(`
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
      CREATE INDEX IF NOT EXISTS idx_fotos_poste_id ON fotos(poste_id);
    `);
        console.log('✅ Tabla fotos creada\n');

        // Crear tabla de proyectos
        console.log('🏗️  Creando tabla proyectos...');
        await client.query(`
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
        console.log('✅ Tabla proyectos creada\n');

        // Crear tabla de usuarios_proyectos
        console.log('👥 Creando tabla usuarios_proyectos...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios_proyectos (
        proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
        usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rol_proyecto VARCHAR(50) DEFAULT 'miembro',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (proyecto_id, usuario_id)
      );
    `);
        console.log('✅ Tabla usuarios_proyectos creada\n');

        // Crear usuario admin por defecto
        console.log('👨‍💼 Creando usuario admin por defecto...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await client.query(`
      INSERT INTO users (email, password_hash, nombre, rol)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING;
    `, ['admin@fiberoptic.com', hashedPassword, 'Administrador', 'admin']);

        console.log('✅ Usuario admin creado (admin@fiberoptic.com / admin123)\n');
        console.log('🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE! 🚀');

    } catch (error) {
        console.error('❌ Error en la migración:', error);
    } finally {
        client.release();
        pool.end();
    }
};

migrate();
