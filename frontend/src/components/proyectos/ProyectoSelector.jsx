import { useState, useEffect, useRef } from 'react';
import { useProyecto } from '../../hooks/useProyecto';
import './ProyectoSelector.css';

export const ProyectoSelector = () => {
    const { proyectoActivo, proyectos, cambiarProyecto, loading } = useProyecto();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) {
        return <div className="proyecto-loading">Cargando...</div>;
    }

    if (!proyectos || proyectos.length === 0) {
        return null;
    }

    // Si solo hay un proyecto, mostrar badge
    if (proyectos.length === 1) {
        return (
            <div className="proyecto-badge">
                <svg className="proyecto-badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {proyectos[0].nombre}
            </div>
        );
    }

    const handleSelect = (proyecto) => {
        cambiarProyecto(proyecto.id);
        setIsOpen(false);
    };

    return (
        <div className="proyecto-selector-container" ref={dropdownRef}>
            <button
                className={`proyecto-selector-button ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg className="proyecto-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="proyecto-nombre">
                    {proyectoActivo?.nombre || 'Seleccionar proyecto'}
                </span>
                <svg className="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div className={`proyecto-dropdown ${isOpen ? 'open' : ''}`}>
                {proyectos.map(proyecto => (
                    <div
                        key={proyecto.id}
                        className={`proyecto-dropdown-item ${proyectoActivo?.id === proyecto.id ? 'active' : ''}`}
                        onClick={() => handleSelect(proyecto)}
                    >
                        <svg className="proyecto-dropdown-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <div className="proyecto-dropdown-item-info">
                            <div className="proyecto-dropdown-item-nombre">{proyecto.nombre}</div>
                            <div className="proyecto-dropdown-item-codigo">{proyecto.codigo}</div>
                        </div>
                        {proyectoActivo?.id === proyecto.id && (
                            <svg className="proyecto-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
