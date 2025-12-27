import { useState, useEffect } from 'react';
import { getPendingCount } from '../services/offlineSync.js';

/**
 * Hook para detectar estado offline y sincronización
 */
export const useOffline = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingSync, setPendingSync] = useState(0);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const updatePendingCount = async () => {
            const count = await getPendingCount();
            setPendingSync(count);
        };

        updatePendingCount();

        // Actualizar cuando se completa la sincronización
        const handleSyncCompleted = () => {
            updatePendingCount();
        };

        window.addEventListener('syncCompleted', handleSyncCompleted);

        // Actualizar periódicamente
        const interval = setInterval(updatePendingCount, 10000);

        return () => {
            window.removeEventListener('syncCompleted', handleSyncCompleted);
            clearInterval(interval);
        };
    }, []);

    return { isOnline, pendingSync };
};
