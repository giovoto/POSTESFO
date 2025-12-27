-- Script SQL para crear y configurar la base de datos
-- Ejecutar con: psql -U postgres -f setup_database.sql

-- Crear base de datos
CREATE DATABASE fiber_optic_db;

-- Conectarse a la base de datos
\c fiber_optic_db

-- Habilitar extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verificar PostGIS
SELECT PostGIS_version();

-- Crear tipos ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'tecnico');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE foto_tipo AS ENUM ('panoramica', 'detalle');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla users
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

-- Crear tabla postes
CREATE TABLE IF NOT EXISTS postes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    coordenadas GEOMETRY(Point, 4326),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
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

-- Crear índices geoespaciales
CREATE INDEX IF NOT EXISTS idx_postes_coordenadas ON postes USING GIST(coordenadas);
CREATE INDEX IF NOT EXISTS idx_postes_created_at ON postes(created_at DESC);

-- Crear tabla fotos
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

-- Crear tabla proyectos
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

-- Crear tabla usuarios_proyectos
CREATE TABLE IF NOT EXISTS usuarios_proyectos (
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rol_proyecto VARCHAR(50) DEFAULT 'miembro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (proyecto_id, usuario_id)
);

-- Mensaje de éxito
\echo '✅ Base de datos creada y configurada correctamente'
\echo 'Próximo paso: Ejecutar npm run init-db en la carpeta backend para crear el usuario admin'
