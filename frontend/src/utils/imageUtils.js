/**
 * Utilidades para procesamiento de imágenes
 */

/**
 * Comprime y redimensiona una imagen usando Canvas
 * @param {Blob} imageBlob - El blob de la imagen original
 * @param {object} options - Opciones de configuración
 * @param {number} options.maxWidth - Ancho máximo (default: 1280)
 * @param {number} options.maxHeight - Alto máximo (default: 1280)
 * @param {number} options.quality - Calidad JPEG 0-1 (default: 0.7)
 * @returns {Promise<Blob>} Blob de la imagen comprimida
 */
export const compressImage = async (imageBlob, options = {}) => {
    const {
        maxWidth = 1280,
        maxHeight = 1280,
        quality = 0.7
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(imageBlob);

        img.onload = () => {
            URL.revokeObjectURL(img.src);

            let width = img.width;
            let height = img.height;

            // Calcular nuevas dimensiones manteniendo aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a Blob con la calidad especificada
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Error al comprimir la imagen'));
                    }
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = (err) => reject(err);
    });
};
