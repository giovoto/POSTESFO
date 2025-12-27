import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { Loader } from './components/common/Loader';

// Eager load Login for speed on first interaction
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const PosteList = lazy(() => import('./components/postes/PosteList').then(module => ({ default: module.PosteList })));
const PosteForm = lazy(() => import('./components/postes/PosteForm').then(module => ({ default: module.PosteForm })));
const PosteDetail = lazy(() => import('./components/postes/PosteDetail').then(module => ({ default: module.PosteDetail })));
const MapView = lazy(() => import('./components/map/MapView').then(module => ({ default: module.MapView })));
const UserManagement = lazy(() => import('./components/admin/UserManagement').then(module => ({ default: module.UserManagement })));

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    return (
        <ThemeProvider>
            <Router>
                <Suspense fallback={<Loader />}>
                    <Routes>
                        {/* Ruta pública */}
                        <Route
                            path="/login"
                            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
                        />

                        {/* Rutas protegidas */}
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
                            path="/usuarios"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <UserManagement />
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
        </ThemeProvider>
    );
}

export default App;
