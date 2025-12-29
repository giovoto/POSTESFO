import { useState, useEffect } from 'react';
import { usersAPI, postesAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Navbar } from '../common/Navbar';
import { Loader } from '../common/Loader';
import { UserCreateModal } from './UserCreateModal';
import { UserEditModal } from './UserEditModal';
import { UserProyectosModal } from './UserProyectosModal';
import { useToast } from '../common/Toast';
import { MdAdd, MdDelete, MdEdit, MdAssignment, MdAdminPanelSettings, MdPerson, MdCheckCircle, MdCancel, MdWarning } from 'react-icons/md';

export const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showProyectosModal, setShowProyectosModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const [usersRes, postesRes] = await Promise.all([
                usersAPI.getAll(),
                postesAPI.getAll({ limit: 1000 })
            ]);

            // Robust extraction of users array
            let usersData = [];
            if (usersRes.data && Array.isArray(usersRes.data.users)) {
                usersData = usersRes.data.users;
            } else if (Array.isArray(usersRes.data)) {
                usersData = usersRes.data;
            } else {
                console.error('Unexpected users response format:', usersRes);
                usersData = [];
            }

            setUsers(usersData);

            // Robust extraction of postes array
            const postesData = postesRes.data?.postes || [];

            // Calcular estadísticas por usuario
            const stats = {};
            if (Array.isArray(postesData)) {
                postesData.forEach(poste => {
                    const userId = poste.created_by;
                    if (userId) {
                        if (!stats[userId]) {
                            stats[userId] = {
                                totalPostes: 0,
                                ultimoReporte: null
                            };
                        }
                        stats[userId].totalPostes++;
                        const posteDate = new Date(poste.created_at);
                        if (!stats[userId].ultimoReporte || posteDate > new Date(stats[userId].ultimoReporte)) {
                            stats[userId].ultimoReporte = poste.created_at;
                        }
                    }
                });
            }

            setUserStats(stats);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            setError('Error al cargar la lista de usuarios');
            setUsers([]); // Fallback to empty array to prevent map errors
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await usersAPI.update(userId, { rol: newRole });
            setUsers(prevUsers => prevUsers.map(u =>
                u.id === userId ? { ...u, rol: newRole } : u
            ));
            toast.success('Rol actualizado exitosamente');
        } catch (err) {
            console.error('Error al actualizar rol:', err);
            toast.error('Error al actualizar el rol');
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await usersAPI.update(userId, { activo: !currentStatus });
            setUsers(prevUsers => prevUsers.map(u =>
                u.id === userId ? { ...u, activo: !currentStatus } : u
            ));
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            toast.error('Error al cambiar el estado del usuario');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === currentUser?.id) {
            toast.warning('No puedes eliminar tu propio usuario');
            return;
        }

        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
            return;
        }

        try {
            await usersAPI.delete(userId);
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            toast.success('Usuario eliminado exitosamente');
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            toast.error('Error al eliminar el usuario');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Nunca';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <Loader message="Cargando usuarios..." />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestión de Usuarios</h1>
                        <p className="mt-1 text-slate-500">Administra roles y permisos del equipo</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <MdAdd className="mr-2 h-5 w-5" />
                        Nuevo Usuario
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center animate-shake">
                        <MdWarning className="h-6 w-6 text-red-500 mr-3" />
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up delay-100">
                    <SummaryCard title="Total Usuarios" value={users.length} color="text-blue-600" />
                    <SummaryCard title="Administradores" value={users.filter(u => u.rol === 'admin').length} color="text-purple-600" />
                    <SummaryCard title="Técnicos" value={users.filter(u => u.rol === 'tecnico').length} color="text-teal-600" />
                    <SummaryCard title="Activos" value={users.filter(u => u.activo !== false).length} color="text-green-600" />
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up delay-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reportes</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Último Acceso</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {Array.isArray(users) && users.map((user) => (
                                    <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${user.activo === false ? 'opacity-60 bg-slate-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${user.rol === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-teal-500'}`}>
                                                        {user.nombre?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-slate-900">{user.nombre}</div>
                                                    <div className="text-sm text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative">
                                                <select
                                                    className={`block w-full pl-3 pr-8 py-1 text-xs font-semibold rounded-full border-none focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all cursor-pointer shadow-sm appearance-none ${user.rol === 'admin' ? 'bg-purple-100 text-purple-700 focus:ring-purple-500' : 'bg-blue-100 text-blue-700 focus:ring-blue-500'}`}
                                                    value={user.rol}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    <option value="admin">Administrador</option>
                                                    <option value="tecnico">Técnico</option>
                                                </select>
                                                {user.rol === 'admin' ?
                                                    <MdAdminPanelSettings className="absolute right-2 top-1.5 h-4 w-4 text-purple-500 pointer-events-none" /> :
                                                    <MdPerson className="absolute right-2 top-1.5 h-4 w-4 text-blue-500 pointer-events-none" />
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg font-bold text-slate-700 mr-1">{userStats[user.id]?.totalPostes || 0}</span>
                                                <span className="text-xs text-slate-400">postes</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-600">{formatDate(userStats[user.id]?.ultimoReporte)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleActive(user.id, user.activo !== false)}
                                                disabled={user.id === currentUser?.id}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${user.activo !== false ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                                            >
                                                {user.activo !== false ? (
                                                    <><MdCheckCircle className="mr-1 h-3.5 w-3.5" /> Activo</>
                                                ) : (
                                                    <><MdCancel className="mr-1 h-3.5 w-3.5" /> Inactivo</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowProyectosModal(true);
                                                    }}
                                                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                    title="Asignar Proyectos"
                                                >
                                                    <MdAssignment className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                                                    title="Editar"
                                                >
                                                    <MdEdit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={user.id === currentUser?.id}
                                                    className={`p-1.5 rounded-lg transition-colors ${user.id === currentUser?.id ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                    title="Eliminar"
                                                >
                                                    <MdDelete className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!users || users.length === 0) && (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No hay usuarios registrados</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Legend */}
                <div className="bg-slate-100 rounded-lg p-4 text-sm text-slate-500 animate-fade-in-up delay-300">
                    <p className="flex items-center">
                        <span className="font-semibold mr-1">Nota:</span>
                        Esta tabla muestra cuántos postes ha reportado cada usuario. Los administradores pueden cambiar roles y desactivar accesos instantáneamente.
                    </p>
                </div>

            </div>

            {/* Modals - Keeping them as is for now, they might need internal styling updates too but logic remains */}
            <UserCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={loadUsers}
            />

            <UserEditModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                onUserUpdated={loadUsers}
            />

            <UserProyectosModal
                isOpen={showProyectosModal}
                onClose={() => {
                    setShowProyectosModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onAssign={loadUsers}
            />
        </div>
    );
};

const SummaryCard = ({ title, value, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
        <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
    </div>
);
