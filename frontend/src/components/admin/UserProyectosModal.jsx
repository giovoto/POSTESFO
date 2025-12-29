import { useState, useEffect } from 'react';
import { proyectosAPI } from '../../services/proyectos';
import { useToast } from '../common/Toast';
import './UserProyectosModal.css';

export const UserProyectosModal = ({ isOpen, onClose, user, onAssign }) => {
    const [proyectos, setProyectos] = useState([]);
    const [userProyectos, setUserProyectos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            loadData();
        }
    }, [isOpen, user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [proyectosRes, userProyectosRes] = await Promise.all([
                proyectosAPI.getAll(),
                proyectosAPI.getUserProyectos(user.id)
            ]);

            const allProyectos = proyectosRes.data.proyectos || [];
            setProyectos(allProyectos);

            // Cargar proyectos del usuario
            const userProyectosIds = (userProyectosRes.data || []).map(p => p.proyecto_id);
            setUserProyectos(userProyectosIds);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            // Si falla, al menos mostrar los proyectos disponibles
            setUserProyectos([]);
        } finally {
            setLoading(false);
        }
    };

    const toast = useToast();

    const handleToggleProyecto = async (proyectoId) => {
        try {
            const isAssigned = userProyectos.includes(proyectoId);

            if (isAssigned) {
                await proyectosAPI.removeUser(proyectoId, user.id);
                setUserProyectos(userProyectos.filter(id => id !== proyectoId));
                toast.success('Usuario removido del proyecto');
            } else {
                await proyectosAPI.assignUser(proyectoId, user.id, 'miembro');
                setUserProyectos([...userProyectos, proyectoId]);
                toast.success('Usuario asignado al proyecto');
            }

            if (onAssign) onAssign();
        } catch (error) {
            console.error('Error al asignar/remover proyecto:', error);
            toast.error('Error al actualizar asignación');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h2>Asignar Proyectos</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <p className="text-secondary">
                        Usuario: <strong>{user?.nombre}</strong> ({user?.email})
                    </p>

                    {loading ? (
                        <p>Cargando proyectos...</p>
                    ) : (
                        <div className="proyectos-list">
                            {proyectos.length === 0 ? (
                                <p className="text-secondary">No hay proyectos disponibles</p>
                            ) : (
                                proyectos.map(proyecto => (
                                    <div key={proyecto.id} className="proyecto-item">
                                        <label className="checkbox-label">
                                            <div className="custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={userProyectos.includes(proyecto.id)}
                                                    onChange={() => handleToggleProyecto(proyecto.id)}
                                                />
                                                <span className="checkmark">
                                                    {userProyectos.includes(proyecto.id) && (
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="proyecto-info">
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-color)', flexShrink: 0 }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                                <div>
                                                    <strong>{proyecto.nombre}</strong>
                                                    <span className="proyecto-codigo">{proyecto.codigo}</span>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
