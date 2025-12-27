import { POSTE_STATES, FOTO_TYPES, VALIDATION_RULES } from '../constants/postStates';

/**
 * Calcula el estado actual del flujo de trabajo basado en los datos y fotos
 * @param {object} formData - Datos del formulario
 * @param {Array} photos - Lista de fotos adjuntas (con propiedad 'tipo' o 'etapa')
 * @returns {string} El estado calculado de POSTE_STATES
 */
export const calculateWorkflowState = (formData, photos) => {
    // Si ya estaba finalizado o sincronizado, respetamos ese estado (a menos que se esté editando)
    // Aquí asumimos cálculo dinámico para el proceso de campo.

    if (!formData.nombre || !formData.latitud || !formData.longitud) {
        return POSTE_STATES.BORRADOR;
    }

    const countAntes = photos.filter(p => p.etapa === FOTO_TYPES.ANTES).length;
    const countDespues = photos.filter(p => p.etapa === FOTO_TYPES.DESPUES).length;

    // Lógica progresiva
    if (countAntes < VALIDATION_RULES.MIN_PHOTOS_ANTES) {
        return POSTE_STATES.BORRADOR;
    }

    if (countAntes >= VALIDATION_RULES.MIN_PHOTOS_ANTES && countDespues < VALIDATION_RULES.MIN_PHOTOS_DESPUES) {
        return POSTE_STATES.ANTES_COMPLETO;
    }

    if (countAntes >= VALIDATION_RULES.MIN_PHOTOS_ANTES && countDespues >= VALIDATION_RULES.MIN_PHOTOS_DESPUES) {
        // Podría requerir más validaciones de campos, pero por ahora foto-first
        return POSTE_STATES.FINALIZADO;
    }

    return POSTE_STATES.BORRADOR;
};

/**
 * Verifica si el poste cumple los requisitos para ser finalizado
 */
export const canFinalizePoste = (photos) => {
    const countAntes = photos.filter(p => p.etapa === FOTO_TYPES.ANTES).length;
    const countDespues = photos.filter(p => p.etapa === FOTO_TYPES.DESPUES).length;

    return (
        countAntes >= VALIDATION_RULES.MIN_PHOTOS_ANTES &&
        countDespues >= VALIDATION_RULES.MIN_PHOTOS_DESPUES
    );
};

/**
 * Obtiene mensaje de error o instrucciones según el estado
 */
export const getWorkflowMessage = (currentState) => {
    switch (currentState) {
        case POSTE_STATES.BORRADOR:
            return `Faltan fotos. Requerido: ${VALIDATION_RULES.MIN_PHOTOS_ANTES} de ANTES.`;
        case POSTE_STATES.ANTES_COMPLETO:
            return `Fase 1 lista. Requerido: ${VALIDATION_RULES.MIN_PHOTOS_DESPUES} fotos de DESPUÉS para finalizar.`;
        case POSTE_STATES.FINALIZADO:
            return "¡Listo para guardar y sincronizar!";
        default:
            return "";
    }
};
