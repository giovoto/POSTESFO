import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../config/auth.js';

/**
 * Controlador de Autenticación
 */

/**
 * Login de usuario
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar datos
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Verificar si está activo
        if (!user.activo) {
            return res.status(401).json({
                error: 'Usuario inactivo. Contacta al administrador.'
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = generateToken(user.id, user.email, user.rol);

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Registro de usuario (solo admin)
 */
export const register = async (req, res) => {
    try {
        const { email, password, nombre, rol } = req.body;

        // Validar datos
        if (!email || !password || !nombre) {
            return res.status(400).json({
                error: 'Email, contraseña y nombre son requeridos'
            });
        }

        // Verificar si el email ya existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        const newUser = await User.create({
            email,
            passwordHash,
            nombre,
            rol: rol || 'tecnico'
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: newUser
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Obtener información del usuario actual
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Logout (en cliente se elimina el token)
 */
export const logout = (req, res) => {
    res.json({ message: 'Logout exitoso' });
};
