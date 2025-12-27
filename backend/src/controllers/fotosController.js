import { Foto } from '../models/Foto.js';
import { Poste } from '../models/Poste.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controlador de Fotos
 */

/**
 * Subir foto a un poste
 */
export const uploadFoto = async (req, res) => {
    try {
        const { id: poste_id } = req.params;
        const { tipo } = req.body;

        // Verificar que el poste existe
        const poste = await Poste.findById(poste_id);
        if (!poste) {
            return res.status(404).json({ error: 'Poste no encontrado' });
        }

        // Verificar que se subió un archivo
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }

        // Validar tipo de foto
        if (!['panoramica', 'detalle'].includes(tipo)) {
            return res.status(400).json({
                error: 'Tipo de foto debe ser "panoramica" o "detalle"'
            });
        }

        const uploadDir = path.join(__dirname, '../../uploads');
        const thumbnailDir = path.join(uploadDir, 'thumbnails');

        // Crear directorio de thumbnails si no existe
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }

        // Generar thumbnail
        const thumbnailFilename = `thumb-${req.file.filename}`;
        const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

        await sharp(req.file.path)
            .resize(300, 300, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

        // Crear registro en base de datos
        const foto = await Foto.create({
            poste_id,
            tipo,
            url: `/uploads/${req.file.filename}`,
            thumbnail_url: `/uploads/thumbnails/${thumbnailFilename}`,
            filename: req.file.filename,
            size: req.file.size,
            metadata: {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype
            }
        });

        res.status(201).json({
            message: 'Foto subida exitosamente',
            foto
        });
    } catch (error) {
        console.error('Error al subir foto:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Obtener fotos de un poste
 */
export const getFotosByPoste = async (req, res) => {
    try {
        const { id } = req.params;

        const fotos = await Foto.findByPosteId(id);

        res.json({ fotos });
    } catch (error) {
        console.error('Error al obtener fotos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

/**
 * Eliminar foto
 */
export const deleteFoto = async (req, res) => {
    try {
        const { id } = req.params;

        const foto = await Foto.findById(id);
        if (!foto) {
            return res.status(404).json({ error: 'Foto no encontrada' });
        }

        // Eliminar archivos del sistema
        const uploadDir = path.join(__dirname, '../../uploads');
        const fotoPath = path.join(uploadDir, foto.filename);
        const thumbnailPath = path.join(uploadDir, 'thumbnails', `thumb-${foto.filename}`);

        if (fs.existsSync(fotoPath)) {
            fs.unlinkSync(fotoPath);
        }
        if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
        }

        // Eliminar de base de datos
        await Foto.delete(id);

        res.json({ message: 'Foto eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar foto:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
