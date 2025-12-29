import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de uploads si no existe (solo para desarrollo local)
// En Vercel/serverless, usamos memoryStorage, así que esto no es necesario
const uploadDir = path.join(__dirname, '../../uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (error) {
    // Ignorar en entornos serverless donde el filesystem es read-only
    console.log('Upload directory creation skipped (serverless environment)');
}

// Configuración de almacenamiento
// Configuración de almacenamiento (Memoria para Vercel Blob)
const storage = multer.memoryStorage();

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (JPEG, PNG, WebP)'));
    }
};

// Configuración de multer
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB por defecto
    }
});
