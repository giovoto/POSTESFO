import { useState, useEffect } from 'react';
import { proyectosAPI } from '../../services/proyectos';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Loader } from '../common/Loader';
import { ProyectoSelector } from './ProyectoSelector';
import { useProyecto } from '../../hooks/useProyecto';
import { useToast } from '../common/Toast';
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
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
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
                                    className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                    onClick={() => navigate('/proyectos/nuevo')}
                                >
                                    <span className="text-xl">+</span> Nuevo Proyecto
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
                                            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
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
                                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="block text-lg font-bold text-slate-800 leading-none">
                                                    {proyecto.total_usuarios || 0}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium uppercase">Usuarios</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="block text-lg font-bold text-slate-800 leading-none">
                                                    {proyecto.total_postes || 0}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium uppercase">Postes</span>
                                            </div>
                                        </div>
                                    </div>

                                    {proyecto.ubicacion && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 px-1">
                                            <span className="text-red-500">📍</span>
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
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                    onClick={() => navigate(`/proyectos/${proyecto.id}/editar`)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                    onClick={() => handleDelete(proyecto.id)}
                                                >
                                                    🗑️
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
