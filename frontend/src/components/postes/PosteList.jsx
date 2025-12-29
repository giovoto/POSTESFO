import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useProyecto } from '../../hooks/useProyecto.jsx';
import { Loader } from '../common/Loader';
import { Navbar } from '../common/Navbar';
import { MdAdd, MdSearch, MdFilterList, MdClear, MdPlace, MdConstruction, MdHeight, MdPerson, MdCalendarToday, MdDelete, MdEdit, MdVisibility, MdWarning } from 'react-icons/md';

export const PosteList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { proyectoActivo } = useProyecto();
    const [postes, setPostes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [materialFilter, setMaterialFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [users, setUsers] = useState([]);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        if (proyectoActivo) {
            loadPostes();
        }
    }, [currentPage, estadoFilter, materialFilter, userFilter, searchTerm, proyectoActivo]);

    useEffect(() => {
        if (user?.rol === 'admin') {
            loadUsers();
        }
    }, [user]);

    const loadUsers = async () => {
        try {
            const response = await usersAPI.getAll();
            let usersData = [];
            if (response.data && Array.isArray(response.data.users)) {
                usersData = response.data.users;
            } else if (Array.isArray(response.data)) {
                usersData = response.data;
            }
            setUsers(usersData);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            setUsers([]);
        }
    };

    const loadPostes = async () => {
        try {
            setLoading(true);
            const response = await postesAPI.getAll({
                page: currentPage,
                limit: itemsPerPage,
                estado: estadoFilter,
                material: materialFilter,
                search: searchTerm,
                created_by: userFilter,
                proyecto_id: proyectoActivo?.id
            });

            const list = response.data.postes || response.data || [];
            const pages = response.data.totalPages || 1;

            setPostes(Array.isArray(list) ? list : []);
            setTotalPages(pages);
        } catch (err) {
            console.error('Error al cargar postes:', err);
            if (err.response?.status !== 404) {
                setError('Error al cargar los postes');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadPostes();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este poste?')) {
            return;
        }

        try {
            await postesAPI.delete(id);
            alert('Poste eliminado exitosamente');
            loadPostes();
        } catch (err) {
            console.error('Error al eliminar poste:', err);
            alert('Error al eliminar el poste');
        }
    };

    if (loading && currentPage === 1) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-fade-in-up">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Postes Registrados</h2>
                        <p className="text-slate-500 mt-1 flex items-center">
                            <MdPlace className="mr-1" /> Total: {postes.length} postes
                        </p>
                    </div>
                    <Link
                        to="/postes/nuevo"
                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] transition-all duration-200 transform hover:scale-105"
                    >
                        <MdAdd className="mr-2 h-5 w-5" /> Nuevo Poste
                    </Link>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 animate-fade-in-up delay-100">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdSearch className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
                                placeholder="Buscar por nombre o dirección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors">
                            Buscar
                        </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block pl-1">Estado</label>
                            <select
                                className="block w-full py-2.5 px-4 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent appearance-none cursor-pointer"
                                value={estadoFilter}
                                onChange={(e) => { setEstadoFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">Todos</option>
                                <option value="operativo">Operativo</option>
                                <option value="mantenimiento">En Mantenimiento</option>
                                <option value="dañado">Dañado</option>
                                <option value="fuera_servicio">Fuera de Servicio</option>
                            </select>
                        </div>

                        <div className="relative">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block pl-1">Material</label>
                            <select
                                className="block w-full py-2.5 px-4 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent appearance-none cursor-pointer"
                                value={materialFilter}
                                onChange={(e) => { setMaterialFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="">Todos</option>
                                <option value="concreto">Concreto</option>
                                <option value="madera">Madera</option>
                                <option value="metal">Metal</option>
                                <option value="fibra_vidrio">Fibra de Vidrio</option>
                            </select>
                        </div>

                        {user?.rol === 'admin' && (
                            <div className="relative">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block pl-1">Técnico</label>
                                <select
                                    className="block w-full py-2.5 px-4 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent appearance-none cursor-pointer"
                                    value={userFilter}
                                    onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="">Todos</option>
                                    {Array.isArray(users) && users.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {(estadoFilter || materialFilter || searchTerm || userFilter) && (
                            <div className="flex items-end">
                                <button
                                    className="w-full py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-red-500 transition-colors flex items-center justify-center font-medium"
                                    onClick={() => {
                                        setEstadoFilter('');
                                        setMaterialFilter('');
                                        setUserFilter('');
                                        setSearchTerm('');
                                        setCurrentPage(1);
                                    }}
                                >
                                    <MdClear className="mr-2" /> Limpiar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center">
                        <MdWarning className="h-6 w-6 text-red-500 mr-3" />
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Lista */}
                {loading ? (
                    <Loader />
                ) : postes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <MdPlace className="mx-auto h-16 w-16 text-slate-200 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No se encontraron postes</h3>
                        <p className="mt-1 text-slate-500 mb-6">Prueba ajustando los filtros o crea un nuevo registro.</p>
                        <Link to="/postes/nuevo" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-dark)]">
                            <MdAdd className="mr-2" /> Crear Primer Poste
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
                            {postes.map((poste) => (
                                <div key={poste.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-[var(--primary-color)] transition-colors">
                                                {poste.nombre}
                                            </h3>
                                            <Badge estado={poste.estado} />
                                        </div>

                                        <div className="space-y-2.5 text-sm text-slate-600">
                                            <div className="flex items-center">
                                                <MdPlace className="flex-shrink-0 mr-2 text-slate-400" />
                                                <span className="truncate">{poste.direccion || 'Sin dirección'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MdConstruction className="flex-shrink-0 mr-2 text-slate-400" />
                                                <span className="capitalize">{poste.material}</span>
                                            </div>
                                            {poste.altura && (
                                                <div className="flex items-center">
                                                    <MdHeight className="flex-shrink-0 mr-2 text-slate-400" />
                                                    <span>{poste.altura}m</span>
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                <MdPerson className="flex-shrink-0 mr-2 text-slate-400" />
                                                <span className="text-[var(--primary-color)] font-medium">
                                                    {poste.created_by_nombre || 'Desconocido'}
                                                </span>
                                            </div>
                                            {poste.created_at && (
                                                <div className="flex items-center text-xs text-slate-400 mt-2 pt-2 border-t border-slate-50">
                                                    <MdCalendarToday className="flex-shrink-0 mr-2" />
                                                    <span>{new Date(poste.created_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                                        <button
                                            onClick={() => navigate(`/postes/${poste.id}`)}
                                            className="text-slate-600 hover:text-[var(--primary-color)] font-medium text-sm flex items-center transition-colors"
                                        >
                                            <MdVisibility className="mr-1.5 h-4 w-4" /> Detalles
                                        </button>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/postes/${poste.id}/editar`)}
                                                className="p-1.5 text-slate-400 hover:text-[var(--primary-color)] hover:bg-white rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <MdEdit className="h-5 w-5" />
                                            </button>
                                            {user?.rol === 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(poste.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <MdDelete className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center space-x-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Anterior
                                </button>
                                <span className="text-sm font-medium text-slate-600">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const Badge = ({ estado }) => {
    const styles = {
        'operativo': 'bg-[var(--badge-bg)] text-[var(--badge-text)]',
        'mantenimiento': 'bg-amber-100 text-amber-800',
        'dañado': 'bg-red-100 text-red-800',
        'fuera_servicio': 'bg-slate-100 text-slate-600'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles[estado] || styles['operativo']}`}>
            {estado}
        </span>
    );
};
