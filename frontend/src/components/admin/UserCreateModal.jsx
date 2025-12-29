import { useState } from 'react';
import { authAPI } from '../../services/api';
import { MdAdd, MdClose, MdPerson } from 'react-icons/md';
import './UserCreateModal.css';

export const UserCreateModal = ({ isOpen, onClose, onUserCreated }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        rol: 'tecnico'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.register(formData);
            alert('Usuario creado exitosamente');
            setFormData({ email: '', password: '', nombre: '', rol: 'tecnico' });
            onUserCreated();
            onClose();
        } catch (err) {
            console.error('Error al crear usuario:', err);
            setError(err.response?.data?.message || 'Error al crear el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="flex items-center gap-2">
                        <MdPerson className="text-[var(--primary-color)]" />
                        Crear Nuevo Usuario
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <MdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}

                    <div className="form-group">
                        <label htmlFor="nombre">Nombre Completo *</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="usuario@ejemplo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rol">Rol *</label>
                        <select
                            id="rol"
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            required
                        >
                            <option value="tecnico">Técnico</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
