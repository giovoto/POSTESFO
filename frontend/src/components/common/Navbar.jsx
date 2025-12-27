import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useOffline } from '../../hooks/useOffline.jsx';
import { ProyectoSelector } from '../proyectos/ProyectoSelector';
import './Navbar.css';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { isOnline, pendingSync } = useOffline();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/dashboard" className="navbar-brand">
                    <div className="brand-icon">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                    </div>
                    <span className="brand-text">Postes FO</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="nav-links">
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                        Dashboard
                    </Link>
                    <Link to="/postes" className={`nav-link ${isActive('/postes')}`}>
                        Postes
                    </Link>
                    <Link to="/mapa" className={`nav-link ${isActive('/mapa')}`}>
                        Mapa
                    </Link>
                    {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
                        <Link to="/reportes" className={`nav-link ${isActive('/reportes')}`}>
                            Reportes
                        </Link>
                    )}
                    {user?.rol === 'admin' && (
                        <Link to="/usuarios" className={`nav-link ${isActive('/usuarios')}`}>
                            Usuarios
                        </Link>
                    )}
                    {user?.rol === 'admin' && (
                        <Link to="/proyectos" className={`nav-link ${isActive('/proyectos')}`}>
                            Proyectos
                        </Link>
                    )}
                </div>

                {/* Selector de Proyecto */}
                <ProyectoSelector />

                {/* Actions & Status */}
                <div className="navbar-actions">
                    {/* Status Badge */}
                    <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
                        <span className="status-dot"></span>
                        {isOnline ? 'En línea' : 'Offline'}
                    </div>

                    {/* Sync Badge */}
                    {pendingSync > 0 && (
                        <div className="sync-badge">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {pendingSync}
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="user-menu">
                        <div className="user-info">
                            <span className="user-name">{user?.nombre}</span>
                            <span className="user-role">{user?.rol}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                            title="Cerrar sesión"
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
