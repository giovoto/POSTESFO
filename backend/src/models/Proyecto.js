import pool from '../config/database.js';

export const Proyecto = {
    // Obtener todos los proyectos (filtrado por usuario si no es admin)
    async getAll(userId, userRole) {
        try {
            let query;
            let params;

            if (userRole === 'admin') {
                // Admin ve todos los proyectos
                query = `
                    SELECT p.*, 
                           u.nombre as created_by_nombre,
                           COUNT(DISTINCT up.usuario_id) as total_usuarios,
                           COUNT(DISTINCT po.id) as total_postes
                    FROM proyectos p
                    LEFT JOIN users u ON p.created_by = u.id
                    LEFT JOIN usuarios_proyectos up ON p.id = up.proyecto_id
                    LEFT JOIN postes po ON p.id = po.proyecto_id
                    GROUP BY p.id, u.nombre
                    ORDER BY p.created_at DESC
                `;
                params = [];
            } else {
                // Otros roles solo ven sus proyectos
                query = `
                    SELECT p.*, 
                           u.nombre as created_by_nombre,
                           up.rol_proyecto,
                           COUNT(DISTINCT up2.usuario_id) as total_usuarios,
                           COUNT(DISTINCT po.id) as total_postes
                    FROM proyectos p
                    INNER JOIN usuarios_proyectos up ON p.id = up.proyecto_id
                    LEFT JOIN users u ON p.created_by = u.id
                    LEFT JOIN usuarios_proyectos up2 ON p.id = up2.proyecto_id
                    LEFT JOIN postes po ON p.id = po.proyecto_id
                    WHERE up.usuario_id = $1
                    GROUP BY p.id, u.nombre, up.rol_proyecto
                    ORDER BY p.created_at DESC
                `;
                params = [userId];
            }

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener proyecto por ID
    async getById(id) {
        try {
            const query = `
                SELECT p.*, 
                       u.nombre as created_by_nombre,
                       u.email as created_by_email
                FROM proyectos p
                LEFT JOIN users u ON p.created_by = u.id
                WHERE p.id = $1
            `;
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Crear proyecto
    async create(data) {
        try {
            const query = `
                INSERT INTO proyectos (
                    nombre, descripcion, codigo, ubicacion,
                    fecha_inicio, fecha_fin, estado, created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;
            const values = [
                data.nombre,
                data.descripcion,
                data.codigo,
                data.ubicacion,
                data.fecha_inicio,
                data.fecha_fin,
                data.estado || 'activo',
                data.created_by
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Actualizar proyecto
    async update(id, data) {
        try {
            const query = `
                UPDATE proyectos
                SET nombre = COALESCE($1, nombre),
                    descripcion = COALESCE($2, descripcion),
                    codigo = COALESCE($3, codigo),
                    ubicacion = COALESCE($4, ubicacion),
                    fecha_inicio = COALESCE($5, fecha_inicio),
                    fecha_fin = COALESCE($6, fecha_fin),
                    estado = COALESCE($7, estado),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $8
                RETURNING *
            `;
            const values = [
                data.nombre,
                data.descripcion,
                data.codigo,
                data.ubicacion,
                data.fecha_inicio,
                data.fecha_fin,
                data.estado,
                id
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Eliminar proyecto
    async delete(id) {
        try {
            const query = 'DELETE FROM proyectos WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Obtener usuarios de un proyecto
    async getUsers(proyectoId) {
        try {
            const query = `
                SELECT u.id, u.email, u.nombre, u.rol, u.activo,
                       up.rol_proyecto, up.created_at as asignado_en
                FROM usuarios_proyectos up
                INNER JOIN users u ON up.usuario_id = u.id
                WHERE up.proyecto_id = $1
                ORDER BY u.nombre
            `;
            const result = await pool.query(query, [proyectoId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Asignar usuario a proyecto
    async assignUser(proyectoId, userId, rolProyecto = 'miembro') {
        try {
            const query = `
                INSERT INTO usuarios_proyectos (proyecto_id, usuario_id, rol_proyecto)
                VALUES ($1, $2, $3)
                ON CONFLICT (usuario_id, proyecto_id) 
                DO UPDATE SET rol_proyecto = $3
                RETURNING *
            `;
            const result = await pool.query(query, [proyectoId, userId, rolProyecto]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Quitar usuario de proyecto
    async removeUser(proyectoId, userId) {
        try {
            const query = `
                DELETE FROM usuarios_proyectos
                WHERE proyecto_id = $1 AND usuario_id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [proyectoId, userId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Verificar si usuario tiene acceso a proyecto
    async checkAccess(userId, proyectoId, userRole) {
        try {
            // Admin tiene acceso a todo
            if (userRole === 'admin') return true;

            const query = `
                SELECT EXISTS(
                    SELECT 1 FROM usuarios_proyectos
                    WHERE usuario_id = $1 AND proyecto_id = $2
                ) as has_access
            `;
            const result = await pool.query(query, [userId, proyectoId]);
            return result.rows[0].has_access;
        } catch (error) {
            throw error;
        }
    },

    // Obtener IDs de proyectos del usuario
    async getUserProyectoIds(userId, userRole) {
        try {
            // Admin tiene acceso a todos
            if (userRole === 'admin') {
                const query = 'SELECT id FROM proyectos';
                const result = await pool.query(query);
                return result.rows.map(row => row.id);
            }

            const query = `
                SELECT proyecto_id FROM usuarios_proyectos
                WHERE usuario_id = $1
            `;
            const result = await pool.query(query, [userId]);
            return result.rows.map(row => row.proyecto_id);
        } catch (error) {
            throw error;
        }
    }
};
