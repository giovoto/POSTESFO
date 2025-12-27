import { query } from '../config/database.js';

/**
 * Modelo de Usuario
 */
export const User = {
    /**
     * Crear nuevo usuario
     */
    async create({ email, passwordHash, nombre, rol = 'tecnico' }) {
        const result = await query(
            `INSERT INTO users (email, password_hash, nombre, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, nombre, rol, activo, created_at`,
            [email, passwordHash, nombre, rol]
        );
        return result.rows[0];
    },

    /**
     * Buscar usuario por email
     */
    async findByEmail(email) {
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    },

    /**
     * Buscar usuario por ID
     */
    async findById(id) {
        const result = await query(
            'SELECT id, email, nombre, rol, activo, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    /**
     * Listar todos los usuarios
     */
    async findAll() {
        const result = await query(
            'SELECT id, email, nombre, rol, activo, created_at FROM users ORDER BY created_at DESC'
        );
        return result.rows;
    },

    /**
     * Actualizar usuario
     */
    async update(id, { nombre, rol, activo }) {
        const result = await query(
            `UPDATE users 
       SET nombre = COALESCE($1, nombre),
           rol = COALESCE($2, rol),
           activo = COALESCE($3, activo),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, nombre, rol, activo, updated_at`,
            [nombre, rol, activo, id]
        );
        return result.rows[0];
    },

    /**
     * Eliminar usuario
     */
    async delete(id) {
        await query('DELETE FROM users WHERE id = $1', [id]);
    }
};
