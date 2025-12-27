import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { proyectosAPI } from '../../services/proyectos';
import { Navbar } from '../common/Navbar';
import { Loader } from '../common/Loader';
import { useToast } from '../common/Toast';
import './Proyectos.css';

export const ProyectoForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        descripcion: '',
        ubicacion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'activo'
    });

    useEffect(() => {
        if (id) {
            loadProyecto();
        }
    }, [id]);

    const loadProyecto = async () => {
        try {
            setLoading(true);
            const response = await proyectosAPI.getById(id);
            const proyecto = response.data.proyecto;
            setFormData({
                nombre: proyecto.nombre || '',
                codigo: proyecto.codigo || '',
                descripcion: proyecto.descripcion || '',
                ubicacion: proyecto.ubicacion || '',
                fecha_inicio: proyecto.fecha_inicio ? proyecto.fecha_inicio.split('T')[0] : '',
                fecha_fin: proyecto.fecha_fin ? proyecto.fecha_fin.split('T')[0] : '',
                estado: proyecto.estado || 'activo'
            });
        } catch (err) {
            console.error('Error al cargar proyecto:', err);
            setError('Error al cargar el proyecto');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('=== Enviando Proyecto ===');
            console.log('Datos del formulario:', formData);
            console.log('ID (edición):', id);

            if (id) {
                const response = await proyectosAPI.update(id, formData);
                console.log('Respuesta actualización:', response);
                toast.success('Proyecto actualizado exitosamente');
            } else {
                const response = await proyectosAPI.create(formData);
                console.log('Respuesta creación:', response);
                toast.success('Proyecto creado exitosamente');
            }
            navigate('/proyectos');
        } catch (err) {
            console.error('Error completo:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);

            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Error al guardar el proyecto';

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) {
        return (
            <>
                <Navbar />
                <Loader message="Cargando proyecto..." />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="proyecto-form-container">
                <div className="container">
                    <div className="form-header">
                        <button
                            className="btn-back"
                            onClick={() => navigate('/proyectos')}
                        >
                            ← Volver
                        </button>
                        <h1>{id ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h1>
                    </div>

                    <div className="form-card">
                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre del Proyecto *</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: Proyecto Norte"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="codigo">Código *</label>
                                    <input
                                        type="text"
                                        id="codigo"
                                        name="codigo"
                                        value={formData.codigo}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: NORTE"
                                        maxLength="50"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="descripcion">Descripción</label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Descripción del proyecto"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="ubicacion">Ubicación</label>
                                    <input
                                        type="text"
                                        id="ubicacion"
                                        name="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={handleChange}
                                        placeholder="Ej: Zona Norte, Ciudad"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fecha_inicio">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        id="fecha_inicio"
                                        name="fecha_inicio"
                                        value={formData.fecha_inicio}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fecha_fin">Fecha de Fin</label>
                                    <input
                                        type="date"
                                        id="fecha_fin"
                                        name="fecha_fin"
                                        value={formData.fecha_fin}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="estado">Estado</label>
                                    <select
                                        id="estado"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="pausado">Pausado</option>
                                        <option value="completado">Completado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/proyectos')}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : (id ? 'Actualizar' : 'Crear Proyecto')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
