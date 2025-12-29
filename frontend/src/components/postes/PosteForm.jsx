import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postesAPI, fotosAPI } from '../../services/api';
import { useGeolocation } from '../../hooks/useGeolocation.jsx';
import { useOffline } from '../../hooks/useOffline.jsx';
import { useProyecto } from '../../hooks/useProyecto.jsx';
import { useToast } from '../common/Toast.jsx';
import { addPosteToSync } from '../../store/db';
import { Navbar } from '../common/Navbar';
import { Loader } from '../common/Loader';
import { CameraCapture } from './CameraCapture';
import { MdWifiOff, MdWarning, MdClose, MdCameraAlt, MdLocationOn, MdCheck, MdSave, MdArrowBack } from 'react-icons/md';


export const PosteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { location, error: geoError, loading: geoLoading } = useGeolocation();
    const { isOnline } = useOffline();
    const { proyectoActivo } = useProyecto();
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false); // Modal para elegir fuente
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
            toast.info("Ubicación actualizada automáticamente desde la foto");
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

            // Preparar datos con proyecto_id
            const posteDataWithProject = {
                ...posteData,
                proyecto_id: proyectoActivo?.id || null
            };

            if (isOnline) {
                // Modo online: enviar directamente al servidor
                if (id) {
                    // Actualizar poste existente
                    await postesAPI.update(id, posteDataWithProject);
                    posteId = id;
                } else {
                    // Crear nuevo poste
                    const response = await postesAPI.create(posteDataWithProject);
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

                toast.success(id ? 'Poste actualizado exitosamente' : 'Poste creado exitosamente');
                navigate('/postes');
            } else {
                // Modo offline: guardar en IndexedDB
                const localId = await addPosteToSync({
                    ...posteData,
                    photos: photos
                });

                toast.warning('Sin conexión. El poste se guardó localmente y se sincronizará cuando haya conexión');
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

    // Helper function to convert data URL to Blob
    const dataURLtoBlob = (dataURL) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataURL = event.target.result;
                const blob = dataURLtoBlob(dataURL);

                setPhotos(prev => [...prev, {
                    data: dataURL,
                    blob: blob,
                    tipo: 'panoramica',
                    timestamp: new Date().toISOString()
                }]);
            };
            reader.readAsDataURL(file);
        });

        setShowPhotoOptions(false);
    };

    if (loading && id) {
        return <Loader />;
    }



    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                        <div className="bg-[var(--primary-color)] px-8 py-6 flex justify-between items-center text-white">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {id ? 'Editar Poste' : 'Nuevo Poste'}
                            </h2>
                            {!isOnline && (
                                <div className="animate-pulse flex items-center bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                    <MdWifiOff className="mr-1" /> Modo Offline
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center text-red-700">
                                    <MdWarning className="h-6 w-6 mr-3 flex-shrink-0" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            {geoError && (
                                <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg flex items-center text-orange-700">
                                    <MdWarning className="h-6 w-6 mr-3 flex-shrink-0" />
                                    <span>No se pudo obtener la ubicación: {geoError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8 pb-24 md:pb-0">
                                {/* Información Básica */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center border-b border-slate-200 pb-2">
                                        Información Básica
                                    </h3>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Nombre del Poste <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                placeholder="Ej: Poste 001"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Dirección</label>
                                            <input
                                                type="text"
                                                name="direccion"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                                                value={formData.direccion}
                                                onChange={handleChange}
                                                placeholder="Ej: Calle Principal #123"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                                                <div className="relative">
                                                    <select
                                                        name="estado"
                                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white shadow-sm"
                                                        value={formData.estado}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="operativo">Operativo</option>
                                                        <option value="mantenimiento">En Mantenimiento</option>
                                                        <option value="dañado">Dañado</option>
                                                        <option value="fuera_servicio">Fuera de Servicio</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Material</label>
                                                <div className="relative">
                                                    <select
                                                        name="material"
                                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white shadow-sm"
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
                                    </div>
                                </div>

                                {/* Ubicación GPS */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center border-b border-slate-200 pb-2">
                                        Ubicación GPS
                                    </h3>

                                    <div className="mb-6">
                                        {geoLoading ? (
                                            <p className="flex items-center text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <MdLocationOn className="animate-bounce mr-2 h-5 w-5" /> Obteniendo ubicación...
                                            </p>
                                        ) : location ? (
                                            <p className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                                                <MdCheck className="mr-2 h-5 w-5" /> Ubicación obtenida correctamente
                                            </p>
                                        ) : (
                                            <p className="flex items-center text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                                <MdWarning className="mr-2 h-5 w-5" /> Ubicación no disponible
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Latitud <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="latitud"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-white shadow-sm"
                                                value={formData.latitud}
                                                onChange={handleChange}
                                                step="0.00000001"
                                                placeholder="Ej: 4.60971"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Longitud <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="longitud"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-white shadow-sm"
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
                                        className="w-full md:w-auto px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all shadow-sm flex items-center justify-center font-medium"
                                        onClick={handleGetLocation}
                                        disabled={geoLoading || !location}
                                    >
                                        <MdLocationOn className="mr-2 h-5 w-5 text-red-500" /> Actualizar Ubicación
                                    </button>
                                </div>

                                {/* Detalles Técnicos */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center border-b border-slate-200 pb-2">
                                        Detalles Técnicos
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Mantenimiento</label>
                                            <div className="relative">
                                                <select
                                                    name="tipo_mantenimiento"
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white shadow-sm"
                                                    value={formData.tipo_mantenimiento}
                                                    onChange={handleChange}
                                                >
                                                    <option value="preventivo">Preventivo</option>
                                                    <option value="correctivo">Correctivo</option>
                                                    <option value="emergencia">Emergencia</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Número de Serie</label>
                                            <input
                                                type="text"
                                                name="numero_serie"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                                                value={formData.numero_serie}
                                                onChange={handleChange}
                                                placeholder="Ej: SN-12345"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Altura (metros)</label>
                                        <input
                                            type="number"
                                            name="altura"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                                            value={formData.altura}
                                            onChange={handleChange}
                                            step="0.1"
                                            placeholder="Ej: 12.5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones</label>
                                        <textarea
                                            name="observaciones"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm resize-y"
                                            value={formData.observaciones}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="Notas adicionales sobre el poste..."
                                        />
                                    </div>
                                </div>

                                {/* Fotos */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center border-b border-slate-200 pb-2">
                                        Fotografías
                                    </h3>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group shadow-md bg-white border border-slate-200">
                                                <img src={photo.preview} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex flex-col justify-between p-2">
                                                    <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded self-start backdrop-blur-sm">
                                                        {photo.tipo}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity self-end hover:bg-red-600 shadow-lg transform hover:scale-110"
                                                        onClick={() => handleRemovePhoto(index)}
                                                    >
                                                        <MdClose className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer bg-white"
                                            onClick={() => setShowPhotoOptions(true)}
                                        >
                                            <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                                                <MdCameraAlt className="h-6 w-6" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">Agregar Foto</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Botones de Acción - Fijos en móvil */}
                                <div className="fixed md:relative bottom-0 left-0 right-0 md:mt-8 bg-white border-t md:border-t-0 border-slate-200 p-4 md:p-0 flex gap-4 z-10 shadow-lg md:shadow-none">
                                    <button
                                        type="button"
                                        className="flex-1 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold shadow-sm transition-all"
                                        onClick={() => navigate('/postes')}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <MdSave className="mr-2 h-5 w-5" />
                                                {id ? 'Actualizar Poste' : 'Guardar Poste'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Selección de Fuente de Foto */}
            {showPhotoOptions && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Agregar Foto</h3>
                        <p className="text-sm text-slate-600 mb-6">¿Cómo deseas agregar la foto?</p>

                        <div className="space-y-3">
                            {/* Opción: Tomar foto con cámara */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPhotoOptions(false);
                                    setShowCamera(true);
                                }}
                                className="w-full flex items-center justify-between p-4 border-2 border-slate-200 rounded-lg hover:border-[var(--primary-color)] hover:bg-green-50 transition-all group"
                            >
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-[var(--primary-color)] group-hover:text-white transition-colors">
                                        <MdCameraAlt className="h-6 w-6" />
                                    </div>
                                    <div className="ml-4 text-left">
                                        <div className="font-semibold text-slate-800">Tomar Foto</div>
                                        <div className="text-sm text-slate-500">Usar la cámara del dispositivo</div>
                                    </div>
                                </div>
                            </button>

                            {/* Opción: Adjuntar desde archivos */}
                            <label className="w-full flex items-center justify-between p-4 border-2 border-slate-200 rounded-lg hover:border-[var(--primary-color)] hover:bg-green-50 transition-all group cursor-pointer">
                                <div className="flex items-center">
                                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-[var(--primary-color)] group-hover:text-white transition-colors">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div className="ml-4 text-left">
                                        <div className="font-semibold text-slate-800">Adjuntar Archivo</div>
                                        <div className="text-sm text-slate-500">Seleccionar desde galería</div>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowPhotoOptions(false)}
                            className="mt-6 w-full py-2.5 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

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
