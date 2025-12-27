import { useState, useRef, useEffect } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation.jsx';
import { MdClose, MdCameraAlt, MdRefresh, MdCheck, MdLandscape, MdZoomIn } from 'react-icons/md';
import './CameraCapture.css';

export const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [fotoTipo, setFotoTipo] = useState('panoramica');
    const [error, setError] = useState('');
    const { location } = useGeolocation();

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Cámara trasera en móviles
                    width: { ideal: 1280 }, // Resolución balanceada
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }
        } catch (err) {
            console.error('Error al acceder a la cámara:', err);
            setError('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Configurar tamaño del canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Dibujar frame del video en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // DATA OVERLAY (Incrustar Datos)
        const timestamp = new Date().toLocaleString('es-CO');
        const gpsText = location
            ? `Lat: ${location.latitud.toFixed(6)} Long: ${location.longitud.toFixed(6)} `
            : 'Sin señal GPS';

        // Configurar estilo del texto
        context.font = '16px Arial';
        context.fillStyle = 'rgba(0, 0, 0, 0.6)';
        context.fillRect(10, canvas.height - 60, canvas.width - 20, 50); // Fondo oscuro inferior

        context.fillStyle = '#fff';
        context.font = 'bold 16px Arial';
        context.fillText(timestamp, 20, canvas.height - 35);

        context.fillStyle = '#48dd0a'; // Verde acento
        context.font = 'bold 14px Arial';
        context.fillText(gpsText, 20, canvas.height - 15);

        if (fotoTipo) {
            // Badge de tipo en la parte superior
            context.fillStyle = 'rgba(0, 0, 0, 0.6)';
            context.fillRect(10, 10, 120, 30);
            context.fillStyle = '#fff';
            context.fillText(fotoTipo === 'panoramica' ? 'Panorámica' : 'Detalle', 20, 30);
        }

        // Convertir a blob
        canvas.toBlob(async (blob) => {
            if (blob) {
                try {
                    // COMPRESIÓN: Reducir tamaño antes de guardar
                    const { compressImage } = await import('../../utils/imageUtils');
                    const compressedBlob = await compressImage(blob, {
                        maxWidth: 1280,
                        maxHeight: 1280,
                        quality: 0.7
                    });

                    const preview = URL.createObjectURL(compressedBlob);
                    setCapturedPhoto({
                        blob: compressedBlob,
                        preview,
                        tipo: fotoTipo,
                        timestamp: new Date().toISOString(),
                        location: location ? {
                            latitud: location.latitud,
                            longitud: location.longitud,
                            altitude: location.altitude || 0,
                            accuracy: location.accuracy
                        } : null
                    });
                } catch (err) {
                    console.error('Error al comprimir imagen:', err);
                    // Fallback a imagen sin comprimir si falla
                    const preview = URL.createObjectURL(blob);
                    setCapturedPhoto({
                        blob,
                        preview,
                        tipo: fotoTipo,
                        timestamp: new Date().toISOString(),
                        location: location ? {
                            latitud: location.latitud,
                            longitud: location.longitud,
                            altitude: location.altitude || 0,
                            accuracy: location.accuracy
                        } : null
                    });
                }
            }
        }, 'image/jpeg', 0.9); // Calidad inicial alta para el input de la compresión
    };

    const handleRetake = () => {
        if (capturedPhoto) {
            URL.revokeObjectURL(capturedPhoto.preview);
        }
        setCapturedPhoto(null);
    };

    const handleSave = () => {
        if (capturedPhoto) {
            onCapture(capturedPhoto);
            stopCamera();
        }
    };

    const handleClose = () => {
        if (capturedPhoto) {
            URL.revokeObjectURL(capturedPhoto.preview);
        }
        stopCamera();
        onClose();
    };

    return (
        <div className="camera-modal">
            <div className="camera-container">
                <div className="camera-header">
                    <h3>Capturar Foto</h3>
                    <button className="btn-close" onClick={handleClose}>
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="camera-body">
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {!capturedPhoto ? (
                        <>
                            {/* Vista de cámara en vivo */}
                            <div className="camera-viewport">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="camera-video"
                                />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />

                                <div className="camera-overlay-info">
                                    <p className="overlay-text">{new Date().toLocaleTimeString()}</p>
                                    {location && (
                                        <p className="overlay-gps">
                                            {location.latitud.toFixed(5)}, {location.longitud.toFixed(5)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Controles de tipo de foto */}
                            <div className="camera-controls">
                                <div className="foto-tipo-selector">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="fotoTipo"
                                            value="panoramica"
                                            checked={fotoTipo === 'panoramica'}
                                            onChange={(e) => setFotoTipo(e.target.value)}
                                        />
                                        <span><MdLandscape /> Panorámica</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="fotoTipo"
                                            value="detalle"
                                            checked={fotoTipo === 'detalle'}
                                            onChange={(e) => setFotoTipo(e.target.value)}
                                        />
                                        <span><MdZoomIn /> Detalle</span>
                                    </label>
                                </div>

                                <button
                                    className="btn btn-primary btn-capture"
                                    onClick={capturePhoto}
                                    disabled={!!error}
                                >
                                    <MdCameraAlt size={32} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Vista previa de foto capturada */}
                            <div className="photo-preview">
                                <img src={capturedPhoto.preview} alt="Foto capturada" />
                                <div className="photo-info-actions">
                                    <p>¿Usar esta foto?</p>
                                    <small>Se han incrustado los datos de fecha y GPS.</small>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="photo-actions">
                                <button
                                    className="btn btn-outline"
                                    onClick={handleRetake}
                                >
                                    <MdRefresh size={20} className="mr-1" /> Repetir
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                >
                                    <MdCheck size={20} className="mr-1" /> Usar Foto
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
