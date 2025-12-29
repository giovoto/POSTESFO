import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { MdFiberManualRecord, MdWarning, MdLock, MdEmail } from 'react-icons/md';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-container)] flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in-up">

                {/* Header Section */}
                <div className="px-8 pt-10 pb-6 text-center">
                    <div className="mx-auto w-20 h-20 bg-[var(--primary-color)] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 mb-6 group hover:rotate-0 transition-transform duration-300">
                        <MdFiberManualRecord className="h-10 w-10 text-white animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                        Sistema de Postes
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Documentación de Fibra Óptica
                    </p>
                </div>

                {/* Main Content */}
                <div className="px-8 pb-10">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center shadow-sm">
                            <MdWarning className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                            <p className="text-red-700 text-sm font-medium">
                                {typeof error === 'object' ? JSON.stringify(error) : error}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdEmail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all shadow-sm"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdLock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Iniciando sesión...
                                </span>
                            ) : 'Iniciar Sesión'}
                        </button>
                    </form>

                    {/* Demo Banner */}
                    <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                            Credenciales Demo
                        </p>
                        <p className="text-sm font-mono text-slate-700 bg-white inline-block px-3 py-1 rounded border border-slate-200 shadow-sm">
                            admin@fiberoptic.com / admin123
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
