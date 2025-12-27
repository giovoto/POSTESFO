import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { postesAPI, fotosAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Navbar } from '../common/Navbar';
import { Loader } from '../common/Loader';
import { MdPlace, MdConstruction, MdHeight, MdCalendarToday, MdPerson, MdEdit, MdDelete, MdMap, MdNote, MdCamera, MdSearch, MdClose, MdBuild, MdPin } from 'react-icons/md';
import 'leaflet/dist/leaflet.css';
import './PosteDetail.css';

export const PosteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [poste, setPoste] = useState(null);
    const [fotos, setFotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        loadPosteData();
    }, [id]);

    const loadPosteData = async () => {
        try {
            setLoading(true);

            const posteResponse = await postesAPI.getById(id);
            setPoste(posteResponse.data.poste);

            try {
                const fotosResponse = await fotosAPI.getByPoste(id);
                setFotos(fotosResponse.data.fotos || []);
            } catch (err) {
                console.log('No hay fotos para este poste');
                setFotos([]);
            }
        } catch (err) {
            console.error('Error al cargar poste:', err);
            setError('Error al cargar los datos del poste');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de eliminar este poste? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await postesAPI.delete(id);
            alert('Poste eliminado exitosamente');
            navigate('/postes');
        } catch (err) {
            console.error('Error al eliminar poste:', err);
            alert('Error al eliminar el poste');
        }
    };

    const handleDeletePhoto = async (fotoId) => {
        if (!window.confirm('¿Eliminar esta foto?')) {
            return;
        }

        try {
            await fotosAPI.delete(fotoId);
            setFotos(prev => prev.filter(f => f.id !== fotoId));
            alert('Foto eliminada');
        } catch (err) {
            console.error('Error al eliminar foto:', err);
            alert('Error al eliminar la foto');
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error || !poste) {
        return (
            <>
                <Navbar />
                <div className="container" style={{ padding: '2rem' }}>
                    <div className="alert alert-danger">
                        {error || 'Poste no encontrado'}
                    </div>
                    <Link to="/postes" className="btn btn-outline">
                        ← Volver a la lista
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="poste-detail-container">
                <div className="container">
                    {/* Header */}
                    <div className="detail-header">
                        <div>
                            <Link to="/postes" className="breadcrumb">
                                ← Volver a la lista
                            </Link>
                            <h2>{poste.nombre}</h2>
                            <span className={`badge badge-${getEstadoBadge(poste.estado)}`}>
                                {poste.estado}
                            </span>
                        </div>
                        <div className="header-actions">
                            <Link to={`/postes/${id}/editar`} className="btn btn-outline">
                                <MdEdit className="inline mr-1" /> Editar
                            </Link>
                            {user?.rol === 'admin' && (
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    <MdDelete className="inline mr-1" /> Eliminar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="detail-grid">
                        {/* Información Principal */}
                        <div className="detail-section card">
                            <h3 className="section-title">Información General</h3>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label"><MdPlace className="inline mr-1" /> Dirección</span>
                                    <span className="info-value">{poste.direccion || 'No especificada'}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label"><MdConstruction className="inline mr-1" /> Material</span>
                                    <span className="info-value">{poste.material}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label"><MdHeight className="inline mr-1" /> Altura</span>
                                    <span className="info-value">{poste.altura ? `${poste.altura}m` : 'No especificada'}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label"><MdBuild className="inline mr-1" /> Tipo de Mantenimiento</span>
                                    <span className="info-value">{poste.tipo_mantenimiento || 'No especificado'}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label"><MdPin className="inline mr-1" /> Número de Serie</span>
                                    <span className="info-value">{poste.numero_serie || 'No especificado'}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label"><MdCalendarToday className="inline mr-1" /> Fecha de Registro</span>
                                    <span className="info-value">
                                        {new Date(poste.created_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label"><MdPerson className="inline mr-1" /> Reportado por</span>
                                    <span className="info-value text-primary font-weight-bold">
                                        {poste.created_by_nombre || 'Desconocido'}
                                    </span>
                                </div>
                            </div>

                            {poste.observaciones && (
                                <div className="observations">
                                    <h4><MdNote className="inline mr-1" /> Observaciones</h4>
                                    <p>{poste.observaciones}</p>
                                </div>
                            )}
                        </div>

                        {/* Ubicación GPS */}
                        <div className="detail-section card">
                            <h3 className="section-title">Ubicación GPS</h3>

                            <div className="coordinates-info">
                                <div className="coordinate-item">
                                    <span className="coord-label">Latitud:</span>
                                    <span className="coord-value">{parseFloat(poste.latitud).toFixed(8)}</span>
                                </div>
                                <div className="coordinate-item">
                                    <span className="coord-label">Longitud:</span>
                                    <span className="coord-value">{parseFloat(poste.longitud).toFixed(8)}</span>
                                </div>
                            </div>

                            <div className="mini-map">
                                <MapContainer
                                    center={[parseFloat(poste.latitud), parseFloat(poste.longitud)]}
                                    zoom={15}
                                    style={{ height: '300px', width: '100%', borderRadius: '8px' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    <Marker position={[parseFloat(poste.latitud), parseFloat(poste.longitud)]}>
                                        <Popup>{poste.nombre}</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>

                            <a
                                href={`https://www.google.com/maps?q=${poste.latitud},${poste.longitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm"
                            >
                                <MdMap className="inline mr-1" /> Ver en Google Maps
                            </a>
                        </div>
                    </div>

                    {/* Galería de Fotos */}
                    <div className="detail-section card">
                        <div className="section-header">
                            <h3 className="section-title">Fotografías ({fotos.length})</h3>
                            <Link to={`/postes/${id}/editar`} className="btn btn-outline btn-sm">
                                <MdCamera className="inline mr-1" /> Agregar Fotos
                            </Link>
                        </div>

                        {fotos.length === 0 ? (
                            <p className="text-center text-secondary">
                                No hay fotografías para este poste
                            </p>
                        ) : (
                            <div className="photos-gallery">
                                {fotos.map((foto) => (
                                    <div key={foto.id} className="photo-card">
                                        <img
                                            src={foto.url}
                                            alt={`Foto ${foto.tipo}`}
                                            onClick={() => setSelectedPhoto(foto)}
                                        />
                                        <div className="photo-card-footer">
                                            <span className="badge badge-primary">
                                                {foto.tipo === 'panoramica' ?
                                                    <><MdCamera className="inline mr-1" /> Panorámica</> :
                                                    <><MdSearch className="inline mr-1" /> Detalle</>
                                                }
                                            </span>
                                            {user?.rol === 'admin' && (
                                                <button
                                                    className="btn-delete-photo"
                                                    onClick={() => handleDeletePhoto(foto.id)}
                                                >
                                                    <MdDelete />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Foto Ampliada */}
            {selectedPhoto && (
                <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
                    <div className="photo-modal-content">
                        <button className="btn-close-modal" onClick={() => setSelectedPhoto(null)}>
                            <MdClose />
                        </button>
                        <img src={selectedPhoto.url} alt="Foto ampliada" />
                        <div className="photo-modal-info">
                            <span className="badge badge-primary">
                                {selectedPhoto.tipo === 'panoramica' ?
                                    <><MdCamera className="inline mr-1" /> Panorámica</> :
                                    <><MdSearch className="inline mr-1" /> Detalle</>
                                }
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

function getEstadoBadge(estado) {
    const badges = {
        'operativo': 'success',
        'mantenimiento': 'warning',
        'dañado': 'danger',
        'fuera_servicio': 'danger'
    };
    return badges[estado] || 'primary';
}
