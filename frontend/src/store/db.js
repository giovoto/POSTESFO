import Dexie from 'dexie';

/**
 * Base de datos IndexedDB para almacenamiento offline
 */
export const db = new Dexie('FiberOpticDB');

db.version(1).stores({
    postes: '++id, nombre, latitud, longitud, synced, created_at',
    fotos: '++id, poste_id, tipo, blob, synced',
    syncQueue: '++id, type, data, timestamp'
});

// V2: Agregamos estados de workflow y etapa de foto + Mejoras en SyncQueue
db.version(2).stores({
    postes: '++id, nombre, latitud, longitud, synced, created_at, workflow_status',
    fotos: '++id, poste_id, tipo, etapa, blob, synced',
    syncQueue: '++id, type, data, timestamp, status, retries' // status: PENDING, ERROR | retries: int
});

/**
 * Agregar poste a la cola de sincronización
 */
export const addPosteToSync = async (posteData) => {
    try {
        const id = await db.postes.add({
            ...posteData,
            synced: false,
            created_at: new Date().toISOString()
        });

        await db.syncQueue.add({
            type: 'CREATE_POSTE',
            data: { ...posteData, localId: id },
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            retries: 0
        });

        return id;
    } catch (error) {
        console.error('Error al agregar poste offline:', error);
        throw error;
    }
};

/**
 * Agregar foto a la cola de sincronización
 */
export const addFotoToSync = async (posteId, fotoBlob, tipo) => {
    try {
        const id = await db.fotos.add({
            poste_id: posteId,
            tipo,
            blob: fotoBlob,
            synced: false
        });

        await db.syncQueue.add({
            type: 'UPLOAD_FOTO',
            data: { posteId, fotoId: id, tipo },
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            retries: 0
        });

        return id;
    } catch (error) {
        console.error('Error al agregar foto offline:', error);
        throw error;
    }
};

/**
 * Obtener items pendientes de sincronización
 */
export const getPendingSyncItems = async () => {
    return await db.syncQueue.toArray();
};

/**
 * Marcar item como sincronizado
 */
export const markAsSynced = async (syncId, serverId) => {
    await db.syncQueue.delete(syncId);
};

/**
 * Limpiar datos sincronizados antiguos
 */
export const cleanupSyncedData = async (daysOld = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await db.postes
        .where('synced')
        .equals(true)
        .and(item => new Date(item.created_at) < cutoffDate)
        .delete();
};
