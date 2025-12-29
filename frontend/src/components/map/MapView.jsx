import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { postesAPI } from '../../services/api';
import { useProyecto } from '../../hooks/useProyecto.jsx';
import { Loader } from '../common/Loader';
import { Navbar } from '../common/Navbar';
import 'leaflet/dist/leaflet.css';
import { MdPlace, MdMenu, MdClose } from 'react-icons/md';

// Fix para iconos de Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to control map center - ESTILO GOOGLE MAPS
function MapController({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, 16, {
                duration: 1.5 // Animación suave
            });
        }
    }, [center, map]);

    return null;
}

export const MapView = () => {
    const navigate = useNavigate();
    const { proyectoActivo } = useProyecto();
    const [postes, setPostes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState(null);
    const [selectedPoste, setSelectedPoste] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (proyectoActivo) {
            loadPostes();
        }
    }, [proyectoActivo]);

    const loadPostes = async () => {
        try {
            const response = await postesAPI.getAll({
                limit: 1000,
                proyecto_id: proyectoActivo?.id
            });
            setPostes(response.data.postes || []);
        } catch (err) {
            console.error('Error al cargar postes:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    const initialCenter = postes.length > 0
        ? [parseFloat(postes[0].latitud), parseFloat(postes[0].longitud)]
        : [4.60971, -74.08175];

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                {/* Toggle Button - Solo móvil */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        zIndex: 1000,
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        display: 'block'
                    }}
                    className="md:hidden"
                >
                    {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
                </button>

                {/* Sidebar - Responsive */}
                <div
                    style={{
                        width: '300px',
                        background: 'white',
                        borderRight: '1px solid #e5e7eb',
                        overflowY: 'auto',
                        padding: '20px',
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: sidebarOpen ? 0 : '-300px',
                        transition: 'left 0.3s ease',
                        zIndex: 999,
                        boxShadow: sidebarOpen ? '2px 0 10px rgba(0,0,0,0.1)' : 'none'
                    }}
                    className="md:relative md:left-0"
                >
                    <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                        Postes: {postes.length}
                    </h3>
                    {postes.map(p => (
                        <div
                            key={p.id}
                            style={{
                                padding: '10px',
                                marginBottom: '10px',
                                background: selectedPoste?.id === p.id ? '#42CB09' : '#f9fafb',
                                color: selectedPoste?.id === p.id ? 'white' : 'black',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: selectedPoste?.id === p.id ? '2px solid #39B007' : '1px solid #e5e7eb'
                            }}
                            onClick={() => {
                                setSelectedPoste(p);
                                setMapCenter([parseFloat(p.latitud), parseFloat(p.longitud)]);
                                // Cerrar sidebar en móvil al seleccionar
                                if (window.innerWidth < 768) {
                                    setSidebarOpen(false);
                                }
                            }}
                            onDoubleClick={() => navigate(`/postes/${p.id}`)}
                        >
                            <div style={{ fontWeight: 'bold' }}>{p.nombre}</div>
                            <div style={{ fontSize: '12px', opacity: selectedPoste?.id === p.id ? 0.9 : 0.6 }}>
                                {p.direccion || 'Sin dirección'}
                            </div>
                            <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
                                Doble click para ver detalles
                            </div>
                        </div>
                    ))}
                </div>

                {/* MAPA */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <MapContainer
                        center={initialCenter}
                        zoom={13}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: '100%',
                            width: '100%'
                        }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        <MapController center={mapCenter} />

                        {postes.map(poste => (
                            <Marker
                                key={poste.id}
                                position={[parseFloat(poste.latitud), parseFloat(poste.longitud)]}
                            >
                                <Popup>
                                    <div>
                                        <h4><strong>{poste.nombre}</strong></h4>
                                        <p style={{ margin: '5px 0' }}>{poste.direccion}</p>
                                        <p style={{ fontSize: '12px', color: '#666' }}>Estado: {poste.estado}</p>
                                        <button
                                            onClick={() => navigate(`/postes/${poste.id}`)}
                                            style={{
                                                marginTop: '8px',
                                                padding: '6px 12px',
                                                background: '#42CB09',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Ver detalles
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};
