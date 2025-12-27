import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useOffline } from '../../hooks/useOffline.jsx';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { isOnline, pendingSync } = useOffline();
    const { theme, toggleTheme } = useTheme();
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
                    {user?.rol === 'admin' && (
                        <Link to="/usuarios" className={`nav-link ${isActive('/usuarios')}`}>
                            Usuarios
                        </Link>
                    )}
                </div>

                {/* Actions & Status */}
                <div className="navbar-actions">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                    >
                        {theme === 'light' ? (
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        )}
                    </button>

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
