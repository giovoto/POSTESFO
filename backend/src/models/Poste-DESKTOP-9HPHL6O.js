import { query } from '../config/database.js';

/**
 * Modelo de Poste
 */
export const Poste = {
    /**
     * Crear nuevo poste
     */
    async create(data) {
        const {
            nombre,
            direccion,
            latitud,
            longitud,
            estado,
            tipo_mantenimiento,
            numero_serie,
            altura,
            material,
            observaciones,
            created_by
        } = data;

        const result = await query(
            `INSERT INTO postes (
        nombre, direccion, latitud, longitud,
        estado, tipo_mantenimiento, numero_serie, altura, material,
        observaciones, created_by
      )
      VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING *`,
            [
                nombre, direccion, latitud, longitud,
                estado, tipo_mantenimiento, numero_serie, altura, material,
                observaciones, created_by
            ]
        );
        return result.rows[0];
    },

    /**
     * Buscar poste por ID
     */
    async findById(id) {
        const result = await query(
            `SELECT p.*, u.nombre as created_by_nombre, u.email as created_by_email
       FROM postes p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
            [id]
        );
        return result.rows[0];
    },

    /**
     * Listar postes con filtros y paginación
     */
    async findAll({ page = 1, limit = 50, estado, material, search }) {
        const offset = (page - 1) * limit;
        let whereConditions = [];
        let params = [];
        let paramCount = 1;

        if (estado) {
            whereConditions.push(`estado = $${paramCount}`);
            params.push(estado);
            paramCount++;
        }

        if (material) {
            whereConditions.push(`material = $${paramCount}`);
            params.push(material);
            paramCount++;
        }

        if (search) {
            whereConditions.push(`(nombre ILIKE $${paramCount} OR direccion ILIKE $${paramCount} OR numero_serie ILIKE $${paramCount})`);
            params.push(`%${search}%`);
            paramCount++;
        }

        if (arguments[0].created_by) {
            whereConditions.push(`created_by = $${paramCount}`);
            params.push(arguments[0].created_by);
            paramCount++;
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Contar total
        const countResult = await query(
            `SELECT COUNT(*) FROM postes ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Obtener postes
        params.push(limit, offset);
        const result = await query(
            `SELECT p.*, u.nombre as created_by_nombre
       FROM postes p
       LEFT JOIN users u ON p.created_by = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
            params
        );

        return {
            postes: result.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    },

    /**
     * Buscar postes cercanos (radio en km)
     * Usando fórmula Haversine simplificada en SQL
     */
    async findNearby(latitud, longitud, radiusKm = 5, created_by = null) {
        let queryStr = `SELECT p.*, u.nombre as created_by_nombre,
              (
                6371 * acos(
                  cos(radians($1)) * cos(radians(p.latitud)) * cos(radians(p.longitud) - radians($2)) +
                  sin(radians($1)) * sin(radians(p.latitud))
                )
              ) as distancia_km
       FROM postes p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE (
         6371 * acos(
           cos(radians($1)) * cos(radians(p.latitud)) * cos(radians(p.longitud) - radians($2)) +
           sin(radians($1)) * sin(radians(p.latitud))
         )
       ) < $3`;

        const params = [latitud, longitud, radiusKm];

        if (created_by) {
            queryStr += ` AND p.created_by = $4`;
            params.push(created_by);
        }

        queryStr += ` ORDER BY distancia_km ASC`;

        const result = await query(queryStr, params);
        return result.rows;
    },

    /**
     * Actualizar poste
     */
    async update(id, data) {
        const {
            nombre,
            direccion,
            latitud,
            longitud,
            estado,
            tipo_mantenimiento,
            numero_serie,
            altura,
            material,
            observaciones
        } = data;

        const result = await query(
            `UPDATE postes
       SET nombre = COALESCE($1, nombre),
           direccion = COALESCE($2, direccion),
           latitud = COALESCE($3, latitud),
           longitud = COALESCE($4, longitud),
           estado = COALESCE($5, estado),
           tipo_mantenimiento = COALESCE($6, tipo_mantenimiento),
           numero_serie = COALESCE($7, numero_serie),
           altura = COALESCE($8, altura),
           material = COALESCE($9, material),
           observaciones = COALESCE($10, observaciones),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
            [
                nombre, direccion, latitud, longitud,
                estado, tipo_mantenimiento, numero_serie, altura, material,
                observaciones, id
            ]
        );
        return result.rows[0];
    },

    /**
     * Eliminar poste
     */
    async delete(id) {
        await query('DELETE FROM postes WHERE id = $1', [id]);
    }
};
