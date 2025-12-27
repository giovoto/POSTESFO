import { useState, useEffect } from 'react';

/**
 * Hook para obtener geolocalización del dispositivo
 */
export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getLocation = (highAccuracy = true) => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocalización no soportada en este navegador');
            setLoading(false);
            return;
        }

        const options = {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 10000 : 20000,
            maximumAge: 30000 // Aceptar caché de hasta 30 segundos
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitud: position.coords.latitude,
                    longitud: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude
                });
                setLoading(false);
            },
            (err) => {
                console.warn(`Error GPS (HighAccuracy: ${highAccuracy}):`, err.message);

                // Fallback: Si falló alta precisión, intentar baja precisión
                if (highAccuracy && (err.code === 3 || err.code === 1)) {
                    console.log("Intentando con baja precisión...");
                    getLocation(false);
                } else {
                    setError('No se pudo obtener la ubicación. Activa el GPS o sal a un espacio abierto.');
                    setLoading(false);
                }
            },
            options
        );
    };

    useEffect(() => {
        getLocation();

        const watchId = navigator.geolocation?.watchPosition(
            (position) => {
                setLocation({
                    latitud: position.coords.latitude,
                    longitud: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude
                });
            },
            null,
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 }
        );

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    return { location, error, loading, getLocation };
};
