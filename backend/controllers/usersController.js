import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Controlador de Usuarios (Admin)
 */

/**
 * Listar todos los usuarios
 */
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.json({ users });
    } catch (error) {
        next(new AppError('Error al listar usuarios: ' + error.message, 500));
    }
};

/**
 * Crear nuevo usuario (Admin)
 */
export const createUser = async (req, res, next) => {
    try {
        const { email, password, nombre, rol = 'tecnico' } = req.body;

        // Validaciones Manuales (Backup si el middleware falla)
        if (!email || !password || !nombre) {
            return next(new AppError('Email, contraseña y nombre son requeridos', 400));
        }

        // Verificar si el email ya existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return next(new AppError('El email ya está registrado', 400));
        }

        // Hash de contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        const newUser = await User.create({
            email,
            passwordHash,
            nombre,
            rol
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: newUser
        });
    } catch (error) {
        next(new AppError('Error al crear usuario: ' + error.message, 500));
    }
};

/**
 * Actualizar usuario
 */
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, rol, activo, password } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return next(new AppError('Usuario no encontrado', 404));
        }

        // Si se proporciona nueva contraseña
        let updateData = { nombre, rol, activo };

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            updateData.passwordHash = passwordHash;
        }

        const updatedUser = await User.update(id, updateData);

        res.json({
            message: 'Usuario actualizado exitosamente',
            user: updatedUser
        });
    } catch (error) {
        next(new AppError('Error al actualizar usuario: ' + error.message, 500));
    }
};

/**
 * Eliminar usuario
 */
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // No permitir que el admin se elimine a sí mismo
        if (id === req.user.userId) {
            return next(new AppError('No puedes eliminar tu propio usuario', 400));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(new AppError('Usuario no encontrado', 404));
        }

        await User.delete(id);

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        next(new AppError('Error al eliminar usuario: ' + error.message, 500));
    }
};
