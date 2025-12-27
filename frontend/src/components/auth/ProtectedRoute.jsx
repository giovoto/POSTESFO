import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

/**
 * Componente para proteger rutas que requieren autenticación
 */
export const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificar rol si es requerido
    if (requiredRole && user.rol !== requiredRole && user.rol !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
