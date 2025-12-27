-- Script de migración para agregar sistema de proyectos
-- Ejecutar con: psql -U postgres -d fiber_optic_db -f add_proyectos.sql

-- 1. Crear tabla proyectos
CREATE TABLE IF NOT EXISTS proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    ubicacion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50) DEFAULT 'activo',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla usuarios_proyectos (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS usuarios_proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    rol_proyecto VARCHAR(50) DEFAULT 'miembro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, proyecto_id)
);

-- 3. Agregar proyecto_id a tabla postes
ALTER TABLE postes 
ADD COLUMN IF NOT EXISTS proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL;

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_postes_proyecto ON postes(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_proyectos_usuario ON usuarios_proyectos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_proyectos_proyecto ON usuarios_proyectos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);

-- 5. Crear proyecto por defecto para datos existentes
INSERT INTO proyectos (nombre, codigo, descripcion, estado)
VALUES (
    'Proyecto General',
    'GENERAL',
    'Proyecto por defecto para postes existentes',
    'activo'
)
ON CONFLICT (codigo) DO NOTHING;

-- 6. Asignar todos los postes existentes al proyecto general
UPDATE postes 
SET proyecto_id = (SELECT id FROM proyectos WHERE codigo = 'GENERAL')
WHERE proyecto_id IS NULL;

-- 7. Asignar todos los usuarios al proyecto general
INSERT INTO usuarios_proyectos (usuario_id, proyecto_id, rol_proyecto)
SELECT 
    u.id,
    p.id,
    CASE 
        WHEN u.rol = 'admin' THEN 'administrador'
        WHEN u.rol = 'supervisor' THEN 'supervisor'
        ELSE 'miembro'
    END
FROM users u
CROSS JOIN proyectos p
WHERE p.codigo = 'GENERAL'
ON CONFLICT (usuario_id, proyecto_id) DO NOTHING;

-- Mensaje de éxito
\echo '✅ Tablas de proyectos creadas exitosamente'
\echo '✅ Proyecto General creado'
\echo '✅ Postes existentes asignados al Proyecto General'
\echo '✅ Usuarios asignados al Proyecto General'
