import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postesAPI, fotosAPI } from '../../services/api';
import { useGeolocation } from '../../hooks/useGeolocation.jsx';
import { useOffline } from '../../hooks/useOffline.jsx';
import { addPosteToSync } from '../../store/db';
import { Navbar } from '../common/Navbar';
import { Loader } from '../common/Loader';
import { CameraCapture } from './CameraCapture';
import { MdWifiOff, MdWarning, MdClose, MdCameraAlt, MdLocationOn, MdCheck, MdSave, MdArrowBack } from 'react-icons/md';
import './PosteForm.css';

export const PosteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { location, error: geoError, loading: geoLoading } = useGeolocation();
    const { isOnline } = useOffline();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [photos, setPhotos] = useState([]);

    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        latitud: '',
        longitud: '',
        estado: 'operativo',
        tipo_mantenimiento: 'preventivo',
        numero_serie: '',
        altura: '',
        material: 'concreto',
        observaciones: ''
    });

    // Cargar datos del poste si estamos editando
    useEffect(() => {
        if (id) {
            loadPoste();
        }
    }, [id]);

    // Actualizar coordenadas cuando se obtiene la ubicación
    useEffect(() => {
        if (location && !formData.latitud && !formData.longitud) {
            setFormData(prev => ({
                ...prev,
                latitud: location.latitud.toFixed(8),
                longitud: location.longitud.toFixed(8)
            }));
        }
    }, [location]);

    const loadPoste = async () => {
        try {
            setLoading(true);
            const response = await postesAPI.getById(id);
            const poste = response.data.poste;

            setFormData({
                nombre: poste.nombre || '',
                direccion: poste.direccion || '',
                latitud: poste.latitud || '',
                longitud: poste.longitud || '',
                estado: poste.estado || 'operativo',
                tipo_mantenimiento: poste.tipo_mantenimiento || 'preventivo',
                numero_serie: poste.numero_serie || '',
                altura: poste.altura || '',
                material: poste.material || 'concreto',
                observaciones: poste.observaciones || ''
            });
        } catch (err) {
            setError('Error al cargar el poste');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoCapture = (photoData) => {
        setPhotos(prev => [...prev, photoData]);
        setShowCamera(false);

        // AUTO-FILL: Si la foto trae ubicación y el formulario está vacío (o se quiere actualizar), llenamos los datos
        if (photoData.location) {
            setFormData(prev => ({
                ...prev,
                latitud: photoData.location.latitud.toFixed(8),
                longitud: photoData.location.longitud.toFixed(8),
                // Si tuviéramos altura en el GPS, la pondríamos aquí
                // altura: photoData.location.altitude ? photoData.location.altitude.toFixed(2) : prev.altura
            }));

            // Opcional: Mostrar feedback al usuario
            alert("📍 Ubicación actualizada automáticamente desde la foto.");
        }
    };

    const handleRemovePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return false;
        }
        if (!formData.latitud || !formData.longitud) {
            setError('Las coordenadas son requeridas. Permite el acceso a tu ubicación.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // Preparar datos del poste
            const posteData = {
                ...formData,
                latitud: parseFloat(formData.latitud),
                longitud: parseFloat(formData.longitud),
                altura: formData.altura ? parseFloat(formData.altura) : null
            };

            let posteId;

            if (isOnline) {
                // Modo online: enviar directamente al servidor
                if (id) {
                    // Actualizar poste existente
                    await postesAPI.update(id, posteData);
                    posteId = id;
                } else {
                    // Crear nuevo poste
                    const response = await postesAPI.create(posteData);
                    posteId = response.data.poste.id;
                }

                // Subir fotos si hay
                if (photos.length > 0) {
                    for (const photo of photos) {
                        const formData = new FormData();
                        formData.append('foto', photo.blob, 'photo.jpg');
                        formData.append('tipo', photo.tipo);
                        await fotosAPI.uploadPhoto(posteId, formData);
                    }
                }

                alert(id ? 'Poste actualizado exitosamente' : 'Poste creado exitosamente');
                navigate('/postes');
            } else {
                // Modo offline: guardar en IndexedDB
                const localId = await addPosteToSync({
                    ...posteData,
                    photos: photos
                });

                alert('Sin conexión. El poste se guardó localmente y se sincronizará cuando haya conexión.');
                navigate('/postes');
            }
        } catch (err) {
            console.error('Error al guardar poste:', err);
            setError(err.response?.data?.error || 'Error al guardar el poste');
        } finally {
            setLoading(false);
        }
    };

    const handleGetLocation = () => {
        if (location) {
            setFormData(prev => ({
                ...prev,
                latitud: location.latitud.toFixed(8),
                longitud: location.longitud.toFixed(8)
            }));
        }
    };

    if (loading && id) {
        return <Loader />;
    }



    return (
        <>
            <Navbar />
            <div className="poste-form-container">
                <div className="container">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                {id ? 'Editar Poste' : 'Nuevo Poste'}
                            </h2>
                            {!isOnline && (
                                <div className="offline-badge">
                                    <span className="badge badge-warning flex-center">
                                        <MdWifiOff className="mr-1" /> Modo Offline
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger flex-center">
                                    <MdWarning className="mr-2" /> {error}
                                </div>
                            )}

                            {geoError && (
                                <div className="alert alert-warning flex-center">
                                    <MdWarning className="mr-2" /> No se pudo obtener la ubicación: {geoError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Información Básica */}
                                <div className="form-section">
                                    <h3 className="form-section-title">Información Básica</h3>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Nombre del Poste <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            className="form-input"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Ej: Poste 001"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Dirección</label>
                                        <input
                                            type="text"
                                            name="direccion"
                                            className="form-input"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            placeholder="Ej: Calle Principal #123"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Estado</label>
                                            <select
                                                name="estado"
                                                className="form-select"
                                                value={formData.estado}
                                                onChange={handleChange}
                                            >
                                                <option value="operativo">Operativo</option>
                                                <option value="mantenimiento">En Mantenimiento</option>
                                                <option value="dañado">Dañado</option>
                                                <option value="fuera_servicio">Fuera de Servicio</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Material</label>
                                            <select
                                                name="material"
                                                className="form-select"
                                                value={formData.material}
                                                onChange={handleChange}
                                            >
                                                <option value="concreto">Concreto</option>
                                                <option value="madera">Madera</option>
                                                <option value="metal">Metal</option>
                                                <option value="fibra_vidrio">Fibra de Vidrio</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Ubicación GPS */}
                                <div className="form-section">
                                    <h3 className="form-section-title">Ubicación GPS</h3>

                                    <div className="location-status">
                                        {geoLoading ? (
                                            <p className="text-info flex-center"><MdLocationOn className="spin mr-1" /> Obteniendo ubicación...</p>
                                        ) : location ? (
                                            <p className="text-success flex-center"><MdCheck className="mr-1" /> Ubicación obtenida</p>
                                        ) : (
                                            <p className="text-warning flex-center"><MdWarning className="mr-1" /> Ubicación no disponible</p>
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Latitud <span className="required">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="latitud"
                                                className="form-input"
                                                value={formData.latitud}
                                                onChange={handleChange}
                                                step="0.00000001"
                                                placeholder="Ej: 4.60971"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Longitud <span className="required">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="longitud"
                                                className="form-input"
                                                value={formData.longitud}
                                                onChange={handleChange}
                                                step="0.00000001"
                                                placeholder="Ej: -74.08175"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm flex-center"
                                        onClick={handleGetLocation}
                                        disabled={geoLoading || !location}
                                    >
                                        <MdLocationOn className="mr-1" /> Actualizar Ubicación
                                    </button>
                                </div>

                                {/* Detalles Técnicos */}
                                <div className="form-section">
                                    <h3 className="form-section-title">Detalles Técnicos</h3>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Tipo de Mantenimiento</label>
                                            <select
                                                name="tipo_mantenimiento"
                                                className="form-select"
                                                value={formData.tipo_mantenimiento}
                                                onChange={handleChange}
                                            >
                                                <option value="preventivo">Preventivo</option>
                                                <option value="correctivo">Correctivo</option>
                                                <option value="emergencia">Emergencia</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Número de Serie</label>
                                            <input
                                                type="text"
                                                name="numero_serie"
                                                className="form-input"
                                                value={formData.numero_serie}
                                                onChange={handleChange}
                                                placeholder="Ej: SN-12345"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Altura (metros)</label>
                                        <input
                                            type="number"
                                            name="altura"
                                            className="form-input"
                                            value={formData.altura}
                                            onChange={handleChange}
                                            step="0.1"
                                            placeholder="Ej: 12.5"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Observaciones</label>
                                        <textarea
                                            name="observaciones"
                                            className="form-textarea"
                                            value={formData.observaciones}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="Notas adicionales sobre el poste..."
                                        />
                                    </div>
                                </div>

                                {/* Fotos */}
                                <div className="form-section">
                                    <h3 className="form-section-title">Fotografías</h3>

                                    <div className="photos-grid">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="photo-item">
                                                <img src={photo.preview} alt={`Foto ${index + 1}`} />
                                                <div className="photo-overlay">
                                                    <span className="badge badge-primary">{photo.tipo}</span>
                                                    <button
                                                        type="button"
                                                        className="btn-remove-photo"
                                                        onClick={() => handleRemovePhoto(index)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowCamera(true)}
                                    >
                                        📷 Agregar Foto
                                    </button>
                                </div>

                                {/* Botones de Acción */}
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => navigate('/postes')}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : id ? 'Actualizar' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Cámara */}
            {showCamera && (
                <CameraCapture
                    onCapture={handlePhotoCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </>
    );
};
