import { query } from '../config/database.js';

/**
 * Modelo de Foto
 */
export const Foto = {
    /**
     * Crear nueva foto
     */
    async create({ poste_id, tipo, url, thumbnail_url, filename, size, metadata }) {
        const result = await query(
            `INSERT INTO fotos (poste_id, tipo, url, thumbnail_url, filename, size, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [poste_id, tipo, url, thumbnail_url, filename, size, JSON.stringify(metadata)]
        );
        return result.rows[0];
    },

    /**
     * Obtener fotos de un poste
     */
    async findByPosteId(poste_id) {
        const result = await query(
            'SELECT * FROM fotos WHERE poste_id = $1 ORDER BY created_at ASC',
            [poste_id]
        );
        return result.rows;
    },

    /**
     * Buscar foto por ID
     */
    async findById(id) {
        const result = await query(
            'SELECT * FROM fotos WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    /**
     * Eliminar foto
     */
    async delete(id) {
        const result = await query(
            'DELETE FROM fotos WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
};
