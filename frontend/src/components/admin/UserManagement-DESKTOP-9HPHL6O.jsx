import { useState, useEffect } from 'react';
import { usersAPI, postesAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Navbar } from '../common/Navbar';
import { Loader } from '../common/Loader';
import './UserManagement.css';

export const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'tecnico'
    });
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

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

            const usersData = usersRes.data.users || usersRes.data || [];
            const postes = postesRes.data.postes || [];

            // Calcular estadísticas por usuario
            const stats = {};
            postes.forEach(poste => {
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

            setUserStats(stats);
            setUsers(usersData);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            setError('Error al cargar la lista de usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            const response = await usersAPI.create(formData);
            setUsers([response.data.user, ...users]);
            setShowCreateModal(false);
            setFormData({ nombre: '', email: '', password: '', rol: 'tecnico' });
            alert('Usuario creado exitosamente');
        } catch (err) {
            console.error('Error al crear usuario:', err);
            setFormError(err.response?.data?.error || 'Error al crear usuario');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            const updateData = { nombre: formData.nombre, rol: formData.rol };
            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await usersAPI.update(editingUser.id, updateData);
            setUsers(users.map(u => u.id === editingUser.id ? response.data.user : u));
            setShowEditModal(false);
            setEditingUser(null);
            setFormData({ nombre: '', email: '', password: '', rol: 'tecnico' });
            alert('Usuario actualizado exitosamente');
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
            setFormError(err.response?.data?.error || 'Error al actualizar usuario');
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            nombre: user.nombre,
            email: user.email,
            password: '',
            rol: user.rol
        });
        setFormError('');
        setShowEditModal(true);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await usersAPI.update(userId, { rol: newRole });
            setUsers(users.map(u =>
                u.id === userId ? { ...u, rol: newRole } : u
            ));
        } catch (err) {
            console.error('Error al actualizar rol:', err);
            alert('Error al actualizar el rol');
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await usersAPI.update(userId, { activo: !currentStatus });
            setUsers(users.map(u =>
                u.id === userId ? { ...u, activo: !currentStatus } : u
            ));
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            alert('Error al cambiar el estado del usuario');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === currentUser?.id) {
            alert('No puedes eliminar tu propio usuario');
            return;
        }

        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
            return;
        }

        try {
            await usersAPI.delete(userId);
            setUsers(users.filter(u => u.id !== userId));
            alert('Usuario eliminado exitosamente');
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            alert('Error al eliminar el usuario');
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
        <>
            <Navbar />
            <div className="user-management-container">
                <div className="container">
                    {/* Header */}
                    <div className="page-header">
                        <div>
                            <h1>Gestión de Usuarios</h1>
                            <p className="text-secondary">
                                Administra roles y permisos del equipo
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setFormData({ nombre: '', email: '', password: '', rol: 'tecnico' });
                                setFormError('');
                                setShowCreateModal(true);
                            }}
                        >
                            + Nuevo Usuario
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}

                    {/* Stats Summary */}
                    <div className="users-summary">
                        <div className="summary-card">
                            <h3>{users.length}</h3>
                            <p>Total Usuarios</p>
                        </div>
                        <div className="summary-card">
                            <h3>{users.filter(u => u.rol === 'admin').length}</h3>
                            <p>Administradores</p>
                        </div>
                        <div className="summary-card">
                            <h3>{users.filter(u => u.rol === 'tecnico').length}</h3>
                            <p>Técnicos</p>
                        </div>
                        <div className="summary-card">
                            <h3>{users.filter(u => u.activo !== false).length}</h3>
                            <p>Activos</p>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="users-table-container card">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Rol</th>
                                    <th>Postes Reportados</th>
                                    <th>Último Reporte</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className={user.activo === false ? 'inactive' : ''}>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {user.nombre?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <strong>{user.nombre}</strong>
                                                    <p className="user-email">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                className="role-select"
                                                value={user.rol}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={user.id === currentUser?.id}
                                            >
                                                <option value="admin">Administrador</option>
                                                <option value="tecnico">Técnico</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className="stat-number">
                                                {userStats[user.id]?.totalPostes || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="date-text">
                                                {formatDate(userStats[user.id]?.ultimoReporte)}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`status-toggle ${user.activo !== false ? 'active' : 'inactive'}`}
                                                onClick={() => handleToggleActive(user.id, user.activo !== false)}
                                                disabled={user.id === currentUser?.id}
                                            >
                                                {user.activo !== false ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => openEditModal(user)}
                                                    title="Editar"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={user.id === currentUser?.id}
                                                    title="Eliminar"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="empty-state">
                                <p>No hay usuarios registrados</p>
                            </div>
                        )}
                    </div>

                    {/* Roles Info */}
                    <div className="roles-info card">
                        <h3>Roles del Sistema</h3>
                        <div className="roles-grid">
                            <div className="role-card">
                                <h4>Administrador</h4>
                                <ul>
                                    <li>Crear, editar y eliminar usuarios</li>
                                    <li>Cambiar roles de usuarios</li>
                                    <li>Ver estadísticas de reportes</li>
                                    <li>Todas las funciones de técnico</li>
                                </ul>
                            </div>
                            <div className="role-card">
                                <h4>Técnico</h4>
                                <ul>
                                    <li>Crear y editar postes</li>
                                    <li>Subir fotos de postes</li>
                                    <li>Ver mapa de postes</li>
                                    <li>Generar reportes</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Crear Usuario */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Crear Nuevo Usuario</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            {formError && <div className="alert alert-danger">{formError}</div>}

                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="usuario@empresa.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div className="form-group">
                                <label>Rol</label>
                                <select
                                    className="form-control"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                >
                                    <option value="tecnico">Técnico</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                    {formLoading ? 'Creando...' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Usuario */}
            {showEditModal && editingUser && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Usuario</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>X</button>
                        </div>
                        <form onSubmit={handleEditUser}>
                            {formError && <div className="alert alert-danger">{formError}</div>}

                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={formData.email}
                                    disabled
                                />
                                <small className="text-secondary">El email no se puede cambiar</small>
                            </div>

                            <div className="form-group">
                                <label>Nueva Contraseña (opcional)</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    minLength={6}
                                    placeholder="Dejar vacío para mantener actual"
                                />
                            </div>

                            <div className="form-group">
                                <label>Rol</label>
                                <select
                                    className="form-control"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                    disabled={editingUser.id === currentUser?.id}
                                >
                                    <option value="tecnico">Técnico</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                    {formLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
