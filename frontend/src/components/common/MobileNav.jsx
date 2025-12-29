import { useNavigate, useLocation } from 'react-router-dom';
import { MdHome, MdMap, MdFolder, MdPerson, MdCameraAlt } from 'react-icons/md';
import './MobileNav.css';

export const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', icon: MdHome, label: 'Inicio' },
        { path: '/mapa', icon: MdMap, label: 'Mapa' },
        { path: '/postes', icon: MdFolder, label: 'Postes' },
        { path: '/proyectos', icon: MdPerson, label: 'Proyectos' }
    ];

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav className="mobile-nav">
                {navItems.slice(0, 2).map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <item.icon className="mobile-nav-icon" />
                        <span className="mobile-nav-label">{item.label}</span>
                    </button>
                ))}

                {/* Espacio para el FAB */}
                <div className="mobile-nav-spacer"></div>

                {navItems.slice(2).map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <item.icon className="mobile-nav-icon" />
                        <span className="mobile-nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Floating Action Button (FAB) */}
            <button
                onClick={() => navigate('/postes/nuevo')}
                className="mobile-fab"
                aria-label="Reportar Poste"
            >
                <MdCameraAlt className="mobile-fab-icon" />
            </button>
        </>
    );
};
