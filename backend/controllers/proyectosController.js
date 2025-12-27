import { Proyecto } from '../models/Proyecto.js';

// Obtener todos los proyectos
export const getAll = async (req, res) => {
    try {
        const proyectos = await Proyecto.getAll(req.user.id, req.user.rol);
        res.json({ proyectos });
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ message: 'Error al obtener proyectos' });
    }
};

// Obtener proyecto por ID
export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar acceso
        const hasAccess = await Proyecto.checkAccess(req.user.id, id, req.user.rol);
        if (!hasAccess) {
            return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
        }

        const proyecto = await Proyecto.getById(id);
        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.json({ proyecto });
    } catch (error) {
        console.error('Error al obtener proyecto:', error);
        res.status(500).json({ message: 'Error al obtener proyecto' });
    }
};

// Crear proyecto
export const create = async (req, res) => {
    try {
        console.log('=== Crear Proyecto ===');
        console.log('User:', req.user);
        console.log('Body:', req.body);

        // Validar campos requeridos
        if (!req.body.nombre || !req.body.codigo) {
            return res.status(400).json({
                message: 'Nombre y código son requeridos'
            });
        }

        const proyectoData = {
            ...req.body,
            created_by: req.user.userId || req.user.id
        };

        console.log('Datos del proyecto:', proyectoData);

        const proyecto = await Proyecto.create(proyectoData);
        console.log('Proyecto creado:', proyecto);

        // Asignar automáticamente al creador como administrador del proyecto
        await Proyecto.assignUser(proyecto.id, req.user.userId || req.user.id, 'administrador');
        console.log('Usuario asignado al proyecto');

        res.status(201).json({
            message: 'Proyecto creado exitosamente',
            proyecto
        });
    } catch (error) {
        console.error('Error completo al crear proyecto:', error);
        console.error('Stack:', error.stack);

        if (error.code === '23505') { // Código único violado
            return res.status(400).json({ message: 'El código del proyecto ya existe' });
        }

        res.status(500).json({
            message: 'Error al crear proyecto',
            error: error.message
        });
    }
};

// Actualizar proyecto
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await Proyecto.update(id, req.body);

        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.json({
            message: 'Proyecto actualizado exitosamente',
            proyecto
        });
    } catch (error) {
        console.error('Error al actualizar proyecto:', error);
        if (error.code === '23505') {
            return res.status(400).json({ message: 'El código del proyecto ya existe' });
        }
        res.status(500).json({ message: 'Error al actualizar proyecto' });
    }
};

// Eliminar proyecto
export const deleteProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await Proyecto.delete(id);

        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.json({ message: 'Proyecto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        res.status(500).json({ message: 'Error al eliminar proyecto' });
    }
};

// Obtener usuarios del proyecto
export const getUsers = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar acceso
        const hasAccess = await Proyecto.checkAccess(req.user.id, id, req.user.rol);
        if (!hasAccess) {
            return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
        }

        const users = await Proyecto.getUsers(id);
        res.json({ users });
    } catch (error) {
        console.error('Error al obtener usuarios del proyecto:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Asignar usuario a proyecto
export const assignUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, rolProyecto } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId es requerido' });
        }

        await Proyecto.assignUser(id, userId, rolProyecto || 'miembro');
        res.json({ message: 'Usuario asignado exitosamente al proyecto' });
    } catch (error) {
        console.error('Error al asignar usuario:', error);
        res.status(500).json({ message: 'Error al asignar usuario' });
    }
};

// Quitar usuario de proyecto
export const removeUser = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const result = await Proyecto.removeUser(id, userId);
        if (!result) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }

        res.json({ message: 'Usuario removido del proyecto exitosamente' });
    } catch (error) {
        console.error('Error al remover usuario:', error);
        res.status(500).json({ message: 'Error al remover usuario' });
    }
};

// Obtener estadísticas del proyecto
export const getStats = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar acceso
        const hasAccess = await Proyecto.checkAccess(req.user.id, id, req.user.rol);
        if (!hasAccess) {
            return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
        }

        // Aquí puedes agregar lógica para obtener estadísticas específicas
        res.json({ message: 'Estadísticas del proyecto' });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};
