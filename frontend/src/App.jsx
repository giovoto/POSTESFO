import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { Loader } from './components/common/Loader';

// Eager load Login for speed on first interaction
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MapView } from './components/map/MapView'; // EAGER LOAD TO DEBUG

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const PosteList = lazy(() => import('./components/postes/PosteList').then(module => ({ default: module.PosteList })));
const PosteForm = lazy(() => import('./components/postes/PosteForm').then(module => ({ default: module.PosteForm })));
const PosteDetail = lazy(() => import('./components/postes/PosteDetail').then(module => ({ default: module.PosteDetail })));
const UserManagement = lazy(() => import('./components/admin/UserManagement').then(module => ({ default: module.UserManagement })));
const ReportGenerator = lazy(() => import('./components/reportes/ReportGenerator').then(module => ({ default: module.ReportGenerator })));
const ProyectoList = lazy(() => import('./components/proyectos/ProyectoList').then(module => ({ default: module.ProyectoList })));
const ProyectoForm = lazy(() => import('./components/proyectos/ProyectoForm').then(module => ({ default: module.ProyectoForm })));

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <Router>
                <Suspense fallback={<Loader />}>
                    <Routes>
                        {/* Ruta pública */}
                        <Route
                            path="/login"
                            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
                        />

                        {/* Rutas protegidas con Sidebar */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/postes"
                            element={
                                <ProtectedRoute>
                                    <PosteList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/postes/nuevo"
                            element={
                                <ProtectedRoute>
                                    <PosteForm />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/postes/:id"
                            element={
                                <ProtectedRoute>
                                    <PosteDetail />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/postes/:id/editar"
                            element={
                                <ProtectedRoute>
                                    <PosteForm />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/mapa"
                            element={
                                <ProtectedRoute>
                                    <MapView />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/reportes"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <ReportGenerator />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/usuarios"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <UserManagement />
                                </ProtectedRoute>
                            }
                        />

                        {/* Rutas de Proyectos */}
                        <Route
                            path="/proyectos"
                            element={
                                <ProtectedRoute>
                                    <ProyectoList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/proyectos/nuevo"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <ProyectoForm />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/proyectos/:id/editar"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <ProyectoForm />
                                </ProtectedRoute>
                            }
                        />

                        {/* Ruta por defecto */}
                        <Route
                            path="/"
                            element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
                        />

                        {/* Ruta 404 */}
                        <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                    </Routes>
                </Suspense>
            </Router>
        </>
    );
}

export default App;
