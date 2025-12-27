import { Foto } from '../models/Foto.js';
import { Poste } from '../models/Poste.js';
import sharp from 'sharp';
import path from 'path';
import { put, del } from '@vercel/blob';
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

        // Subir a Vercel Blob
        const blob = await put(req.file.originalname, req.file.buffer, {
            access: 'public',
            contentType: req.file.mimetype
        });

        // Crear registro en base de datos
        // Nota: Ya no generamos thumbnails separados, usamos la misma URL
        // O podríamos generar thumbnails con un servicio externo o sharp en memoria si fuera crítico,
        // pero por simplicidad en serverless, usaremos la imagen original o optimizada por el frontend.
        const foto = await Foto.create({
            poste_id,
            tipo,
            url: blob.url,
            thumbnail_url: blob.url, // Vercel Blob no redimensiona auto, usamos la misma por ahora
            filename: blob.pathname, // Guardamos el pathname del blob
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

        // Eliminar de Vercel Blob
        if (foto.url) {
            try {
                await del(foto.url);
            } catch (blobError) {
                console.warn('Error eliminando blob (puede que ya no exista):', blobError);
            }
        }

        // Eliminar de base de datos
        await Foto.delete(id);

        res.json({ message: 'Foto eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar foto:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
