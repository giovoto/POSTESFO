import { useState, useEffect } from 'react';
import { proyectosAPI } from '../../services/proyectos';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Loader } from '../common/Loader';
import { ProyectoSelector } from './ProyectoSelector';
import { useProyecto } from '../../hooks/useProyecto';
import { useToast } from '../common/Toast';
import { MdFolder, MdAdd, MdPeople, MdPlace, MdEdit, MdDelete, MdLocationOn } from 'react-icons/md';
import './Proyectos.css';

export const ProyectoList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProyecto, setEditingProyecto] = useState(null);

    useEffect(() => {
        loadProyectos();
    }, []);

    const loadProyectos = async () => {
        try {
            setLoading(true);
            const response = await proyectosAPI.getAll();
            setProyectos(response.data.proyectos || []);
        } catch (err) {
            console.error('Error al cargar proyectos:', err);
            setError('Error al cargar proyectos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este proyecto?')) return;

        try {
            await proyectosAPI.delete(id);
            setProyectos(proyectos.filter(p => p.id !== id));
            toast.success('Proyecto eliminado exitosamente');
        } catch (err) {
            console.error('Error al eliminar proyecto:', err);
            toast.error('Error al eliminar proyecto');
        }
    };

    const getEstadoBadgeClass = (estado) => {
        return estado === 'activo' ? 'badge-success' : 'badge-secondary';
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <Loader message="Cargando proyectos..." />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="proyectos-container">
                <div className="container">
                    {/* Header */}
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <MdFolder className="w-8 h-8 text-[var(--primary-color)]" />
                                Gestión de Proyectos
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg">
                                Administra proyectos y asigna usuarios
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Selector rápido de proyecto */}
                            <div className="w-full md:w-auto">
                                <ProyectoSelector />
                            </div>

                            {user?.rol === 'admin' && (
                                <button
                                    className="btn-primary inline-flex items-center px-6 py-3 rounded-xl gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 font-bold"
                                    onClick={() => navigate('/proyectos/nuevo')}
                                >
                                    <MdAdd className="text-xl text-white" /> Nuevo Proyecto
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}

                    {/* Proyectos Grid */}
                    {/* Proyectos Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {proyectos.map(proyecto => (
                            <div key={proyecto.id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-[var(--primary-color)] transition-colors">
                                                {proyecto.nombre}
                                            </h3>
                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-500 border border-slate-200">
                                                {proyecto.codigo}
                                            </span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${proyecto.estado === 'activo'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {proyecto.estado}
                                        </span>
                                    </div>

                                    <p className="text-slate-600 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">
                                        {proyecto.descripcion || 'Sin descripción'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg text-[var(--primary-color)]">
                                                <MdPeople className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="block text-lg font-bold text-slate-800 leading-none">
                                                    {proyecto.total_usuarios || 0}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium uppercase text-nowrap">Usuarios</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                                                <MdLocationOn className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="block text-lg font-bold text-slate-800 leading-none">
                                                    {proyecto.total_postes || 0}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium uppercase text-nowrap">Postes</span>
                                            </div>
                                        </div>
                                    </div>

                                    {proyecto.ubicacion && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 px-1">
                                            <MdPlace className="text-[var(--primary-color)]" />
                                            <span className="truncate">{proyecto.ubicacion}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                                        <button
                                            className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium"
                                            onClick={() => navigate(`/proyectos/${proyecto.id}`)}
                                        >
                                            Ver Detalle
                                        </button>
                                        {user?.rol === 'admin' && (
                                            <>
                                                <button
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                    onClick={() => navigate(`/proyectos/${proyecto.id}/editar`)}
                                                >
                                                    <MdEdit size={20} />
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                    onClick={() => handleDelete(proyecto.id)}
                                                >
                                                    <MdDelete size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {proyectos.length === 0 && (
                        <div className="empty-state">
                            <p>No hay proyectos disponibles</p>
                            {user?.rol === 'admin' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/proyectos/nuevo')}
                                >
                                    Crear Primer Proyecto
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
