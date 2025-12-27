/**
 * ESTADOS DEL FLUJO DE TRABAJO (WORKFLOW)
 * Define el ciclo de vida de un reporte de poste en campo.
 */
export const POSTE_STATES = {
    BORRADOR: 'BORRADOR',               // Creación inicial, datos incompletos
    ANTES_COMPLETO: 'ANTES_COMPLETO',   // Tiene las 2 fotos de "Antes" requeridas
    DESPUES_COMPLETO: 'DESPUES_COMPLETO', // Tiene las 2 fotos de "Después" requeridas
    FINALIZADO: 'FINALIZADO',           // Listo para sincronizar (Datos + 4 fotos)
    EN_COLA: 'EN_COLA',                 // En cola de subida
    SINCRONIZADO: 'SINCRONIZADO',       // Confirmado por el servidor
    ERROR_SYNC: 'ERROR_SYNC'            // Falló la sincronización, requiere atención
};

/**
 * TIPOS DE FOTOS REQUERIDOS
 */
export const FOTO_TYPES = {
    ANTES: 'ANTES',
    DESPUES: 'DESPUES'
};

/**
 * REGLAS DE NEGOCIO
 */
export const VALIDATION_RULES = {
    MIN_PHOTOS_ANTES: 2,
    MIN_PHOTOS_DESPUES: 2,
    TOTAL_PHOTOS_REQUIRED: 4
};
