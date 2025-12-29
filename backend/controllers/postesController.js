import { Poste } from '../models/Poste.js';
import { Proyecto } from '../models/Proyecto.js';

/**
 * Controlador de Postes
 */

/**
 * Crear nuevo poste
 */
export const createPoste = async (req, res) => {
    try {
        const posteData = {
            ...req.body,
            created_by: req.user.userId
        };

        // Validar datos requeridos
        if (!posteData.nombre || !posteData.latitud || !posteData.longitud) {
            return res.status(400).json({
                error: 'Nombre, latitud y longitud son requeridos'
            });
        }

        // Validar que el usuario tenga acceso al proyecto (si no es admin)
        if (posteData.proyecto_id && req.user.rol !== 'admin') {
            const hasAccess = await Proyecto.checkAccess(
                req.user.userId,
                posteData.proyecto_id,
                req.user.rol
            );
            if (!hasAccess) {
                return res.status(403).json({
                    error: 'No tienes acceso a este proyecto'
                });
            }
        }

        const newPoste = await Poste.create(posteData);

        res.status(201).json({
            message: 'Poste creado exitosamente',
            poste: newPoste
        });
    } catch (error) {
        console.error('Error al crear poste:', error);
        res.status(500).json({
            error: error.message,
            details: error.stack,
            type: 'CreatePosteError'
        });
    }
};

/**
 * Obtener poste por ID
 */
export const getPosteById = async (req, res) => {
    try {
        const { id } = req.params;
        const poste = await Poste.findById(id);

        if (!poste) {
            return res.status(404).json({ error: 'Poste no encontrado' });
        }

        res.json({ poste });
    } catch (error) {
        console.error('Error al obtener poste:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Listar postes con filtros
 */
export const getPostes = async (req, res) => {
    try {
        const { page, limit, estado, material, search, proyecto_id, created_by } = req.query;

        // Obtener IDs de proyectos del usuario
        const proyectoIds = await Proyecto.getUserProyectoIds(
            req.user.userId,
            req.user.rol
        );

        const result = await Poste.findAll({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 50,
            estado,
            material,
            search,
            proyecto_id: proyecto_id || null,
            proyectoIds, // Filtrar por proyectos del usuario
            created_by: created_by || null
        });

        res.json(result);
    } catch (error) {
        console.error('Error al listar postes:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Buscar postes cercanos
 */
export const getNearbyPostes = async (req, res) => {
    try {
        const { latitud, longitud, radio } = req.query;

        if (!latitud || !longitud) {
            return res.status(400).json({
                error: 'Latitud y longitud son requeridas'
            });
        }

        // Obtener IDs de proyectos del usuario
        const proyectoIds = await Proyecto.getUserProyectoIds(
            req.user.userId,
            req.user.rol
        );

        const postes = await Poste.findNearby(
            parseFloat(latitud),
            parseFloat(longitud),
            parseFloat(radio) || 5,
            proyectoIds // Filtrar por proyectos del usuario
        );

        res.json({ postes });
    } catch (error) {
        console.error('Error al buscar postes cercanos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Actualizar poste
 */
export const updatePoste = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el poste existe
        const poste = await Poste.findById(id);
        if (!poste) {
            return res.status(404).json({ error: 'Poste no encontrado' });
        }

        // Solo admin o el creador pueden editar
        if (req.user.rol !== 'admin' && poste.created_by !== req.user.userId) {
            return res.status(403).json({
                error: 'No tienes permisos para editar este poste'
            });
        }

        const updatedPoste = await Poste.update(id, req.body);

        res.json({
            message: 'Poste actualizado exitosamente',
            poste: updatedPoste
        });
    } catch (error) {
        console.error('Error al actualizar poste:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Eliminar poste (solo admin)
 */
export const deletePoste = async (req, res) => {
    try {
        const { id } = req.params;

        const poste = await Poste.findById(id);
        if (!poste) {
            return res.status(404).json({ error: 'Poste no encontrado' });
        }

        await Poste.delete(id);

        res.json({ message: 'Poste eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar poste:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
