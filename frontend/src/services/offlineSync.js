import { postesAPI, fotosAPI } from './api.js';
import { db, getPendingSyncItems, markAsSynced } from '../store/db.js';

/**
 * Servicio de sincronización offline
 */

let isSyncing = false;

/**
 * Sincronizar datos pendientes con el servidor
 */
export const syncPendingData = async () => {
    if (isSyncing) {
        console.log('Sincronización ya en progreso...');
        return;
    }

    if (!navigator.onLine) {
        console.log('Sin conexión, sincronización pospuesta');
        return;
    }

    isSyncing = true;
    console.log('🔄 Iniciando sincronización...');

    try {
        // Obtener items PENDING ordenados por ID (FIFO)
        const pendingItems = await db.syncQueue
            .where('status').equals('PENDING')
            .sortBy('id');

        if (pendingItems.length === 0) {
            console.log('✅ No hay datos pendientes de sincronizar');
            return;
        }

        console.log(`📤 Sincronizando ${pendingItems.length} items...`);

        for (const item of pendingItems) {
            try {
                if (item.type === 'CREATE_POSTE') {
                    await syncPoste(item);
                } else if (item.type === 'UPLOAD_FOTO') {
                    await syncFoto(item);
                }

                // Éxito: Eliminar de la cola
                await db.syncQueue.delete(item.id);

            } catch (error) {
                console.error(`Error al sincronizar item ${item.id}:`, error);

                // Manejo de Reintentos
                const newRetries = (item.retries || 0) + 1;
                const newStatus = newRetries >= 3 ? 'ERROR' : 'PENDING';

                await db.syncQueue.update(item.id, {
                    retries: newRetries,
                    status: newStatus,
                    lastError: error.message
                });

                if (newStatus === 'ERROR') {
                    console.error(`❌ Item ${item.id} marcado como ERROR tras 3 intentos.`);
                }
            }
        }

        console.log('✅ Ciclo de sincronización completado');

        // Emitir evento
        window.dispatchEvent(new CustomEvent('syncCompleted', {
            detail: { count: pendingItems.length }
        }));

    } catch (error) {
        console.error('Error crítico en proceso de sincronización:', error);
    } finally {
        isSyncing = false;
    }
};

/**
 * Sincronizar un poste
 */
const syncPoste = async (item) => {
    const { data } = item;
    const { localId, ...posteData } = data;

    // Crear poste en el servidor
    const response = await postesAPI.create(posteData);
    const serverId = response.data.poste.id;

    // Actualizar referencias locales
    await db.postes.update(localId, {
        synced: true,
        serverId
    });

    // Actualizar fotos asociadas
    const fotos = await db.fotos.where('poste_id').equals(localId).toArray();
    for (const foto of fotos) {
        await db.fotos.update(foto.id, { poste_id: serverId });
    }

    console.log(`✅ Poste ${localId} sincronizado (ID servidor: ${serverId})`);
};

/**
 * Sincronizar una foto
 */
const syncFoto = async (item) => {
    const { posteId, fotoId, tipo } = item.data;

    // Obtener foto de IndexedDB
    const foto = await db.fotos.get(fotoId);
    if (!foto) {
        console.warn(`Foto ${fotoId} no encontrada en IndexedDB`);
        return;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('foto', foto.blob);
    formData.append('tipo', tipo);

    // Subir al servidor
    await fotosAPI.upload(posteId, formData);

    // Marcar como sincronizada
    await db.fotos.update(fotoId, { synced: true });

    console.log(`✅ Foto ${fotoId} sincronizada`);
};

/**
 * Iniciar sincronización automática
 */
export const startAutoSync = () => {
    // Sincronizar cuando se recupera la conexión
    window.addEventListener('online', () => {
        console.log('🌐 Conexión restaurada, iniciando sincronización...');
        setTimeout(syncPendingData, 1000);
    });

    // Sincronizar periódicamente si hay conexión
    setInterval(() => {
        if (navigator.onLine) {
            syncPendingData();
        }
    }, 5 * 60 * 1000); // Cada 5 minutos
};

/**
 * Obtener contador de items pendientes
 */
export const getPendingCount = async () => {
    const items = await getPendingSyncItems();
    return items.length;
};
