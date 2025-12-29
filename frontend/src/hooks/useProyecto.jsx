import { useState, useEffect, createContext, useContext } from 'react';
import { proyectosAPI } from '../services/proyectos';

const ProyectoContext = createContext();

export const ProyectoProvider = ({ children }) => {
    const [proyectoActivo, setProyectoActivo] = useState(null);
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load proyectos ONCE on mount
    useEffect(() => {
        loadProyectos();
    }, []); // Empty array = run once only

    // Set active proyecto ONLY when proyectos loads for first time
    // KEY: Do NOT add proyectoActivo to dependencies!
    useEffect(() => {
        // Only run if we have proyectos and haven't set active proyecto yet
        if (proyectos.length > 0 && !proyectoActivo) {
            const savedProyectoId = localStorage.getItem('proyectoActivo');

            if (savedProyectoId) {
                const proyecto = proyectos.find(p => String(p.id) === String(savedProyectoId));
                if (proyecto) {
                    setProyectoActivo(proyecto);
                    return;
                }
            }

            // No saved proyecto or not found, use first one
            setProyectoActivo(proyectos[0]);
            localStorage.setItem('proyectoActivo', String(proyectos[0].id));
        }
    }, [proyectos]); // ONLY depend on proyectos, NOT proyectoActivo!

    const loadProyectos = async () => {
        try {
            setLoading(true);
            const response = await proyectosAPI.getAll();
            setProyectos(response.data.proyectos || []);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            setProyectos([]);
        } finally {
            setLoading(false);
        }
    };

    const cambiarProyecto = (proyectoId) => {
        console.log('Cambiando proyecto a:', proyectoId, 'tipo:', typeof proyectoId);
        console.log('Proyectos disponibles:', proyectos.map(p => ({ id: p.id, tipo: typeof p.id })));

        // Asegurar que ambos IDs sean strings para la comparación
        const targetId = String(proyectoId);
        const proyecto = proyectos.find(p => String(p.id) === targetId);

        console.log('Proyecto encontrado:', proyecto);

        if (proyecto) {
            setProyectoActivo(proyecto);
            localStorage.setItem('proyectoActivo', String(proyecto.id));
            console.log('Proyecto activo cambiado a:', proyecto.nombre);
        } else {
            console.error('Proyecto no encontrado con ID:', proyectoId);
        }
    };

    return (
        <ProyectoContext.Provider value={{
            proyectoActivo,
            proyectos,
            loading,
            cambiarProyecto,
            reloadProyectos: loadProyectos
        }}>
            {children}
        </ProyectoContext.Provider>
    );
};

export const useProyecto = () => {
    const context = useContext(ProyectoContext);
    if (!context) {
        throw new Error('useProyecto debe ser usado dentro de ProyectoProvider');
    }
    return context;
};
