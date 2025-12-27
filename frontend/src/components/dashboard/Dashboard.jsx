import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postesAPI } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Navbar } from '../common/Navbar.jsx';
import { Loader } from '../common/Loader.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { MdFiberManualRecord, MdAdd, MdMap, MdList, MdWarning, MdCheckCircle, MdBuild, MdError, MdCalendarToday, MdPlace } from 'react-icons/md';

// Colores para los gráficos (Tailwind equivalents approx)
const ESTADO_COLORS = {
    operativo: '#22c55e', // green-500
    mantenimiento: '#f59e0b', // amber-500
    dañado: '#ef4444', // red-500
    fuera_servicio: '#6b7280' // gray-500
};

const MATERIAL_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentPostes, setRecentPostes] = useState([]);
    const [allPostes, setAllPostes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        estados: [],
        materiales: [],
        porDia: []
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Obtener todos los postes para estadísticas
            const allResponse = await postesAPI.getAll({ page: 1, limit: 1000 });
            const postes = allResponse.data.postes || [];
            setAllPostes(postes);

            // Obtener postes recientes (solo 5)
            const recentResponse = await postesAPI.getAll({ page: 1, limit: 5 });
            setRecentPostes(recentResponse.data.postes || []);

            // Calcular estadísticas por estado
            const estadoCount = {};
            const materialCount = {};
            const porDiaCount = {};

            postes.forEach(poste => {
                const estado = poste.estado || 'sin_estado';
                estadoCount[estado] = (estadoCount[estado] || 0) + 1;

                const material = poste.material || 'sin_material';
                materialCount[material] = (materialCount[material] || 0) + 1;

                if (poste.created_at) {
                    const fecha = new Date(poste.created_at).toLocaleDateString('es-ES', { weekday: 'short' });
                    porDiaCount[fecha] = (porDiaCount[fecha] || 0) + 1;
                }
            });

            const estadosData = Object.entries(estadoCount).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
                value,
                color: ESTADO_COLORS[name] || '#6b7280'
            }));

            const materialesData = Object.entries(materialCount).map(([name, value], index) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
                value,
                color: MATERIAL_COLORS[index % MATERIAL_COLORS.length]
            }));

            const porDiaData = Object.entries(porDiaCount).slice(-7).map(([name, value]) => ({
                name,
                postes: value
            }));

            setChartData({
                estados: estadosData,
                materiales: materialesData,
                porDia: porDiaData
            });

            // Stats Counters
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const postesHoy = postes.filter(p => new Date(p.created_at) >= hoy).length;

            setStats({
                total: postes.length,
                hoy: postesHoy,
                operativos: estadoCount['operativo'] || 0,
                enMantenimiento: estadoCount['mantenimiento'] || 0,
                dañados: estadoCount['dañado'] || 0
            });
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        ¡Bienvenido, {user?.nombre || 'Usuario'}!
                    </h1>
                    <p className="mt-2 text-lg text-slate-500">
                        Sistema de Documentación de Postes de Fibra Óptica
                    </p>
                </div>

                {loading ? (
                    <Loader message="Analizando datos del sistema..." />
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up delay-100">
                            <StatCard
                                title="Total Postes"
                                value={stats?.total || 0}
                                icon={<MdFiberManualRecord className="h-6 w-6 text-blue-600" />}
                                bgIcon="bg-blue-100"
                            />
                            <StatCard
                                title="Operativos"
                                value={stats?.operativos || 0}
                                valueColor="text-green-600"
                                icon={<MdCheckCircle className="h-6 w-6 text-green-600" />}
                                bgIcon="bg-green-100"
                            />
                            <StatCard
                                title="Mantenimiento"
                                value={stats?.enMantenimiento || 0}
                                valueColor="text-amber-500"
                                icon={<MdBuild className="h-6 w-6 text-amber-600" />}
                                bgIcon="bg-amber-100"
                            />
                            <StatCard
                                title="Dañados"
                                value={stats?.dañados || 0}
                                valueColor="text-red-600"
                                icon={<MdError className="h-6 w-6 text-red-600" />}
                                bgIcon="bg-red-100"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-200">
                            {/* Pie Chart */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Estado de la Red</h3>
                                {chartData.estados.length > 0 ? (
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData.estados}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={110}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {chartData.estados.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex justify-center flex-wrap gap-4 mt-4">
                                            {chartData.estados.map((entry, index) => (
                                                <div key={index} className="flex items-center text-sm text-slate-600">
                                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                                                    {entry.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <EmptyChartState />
                                )}
                            </div>

                            {/* Bar Chart */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Distribución por Material</h3>
                                {chartData.materiales.length > 0 ? (
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData.materiales}>
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis hide />
                                                <Tooltip
                                                    cursor={{ fill: '#f1f5f9' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={40}>
                                                    {chartData.materiales.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <EmptyChartState />
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up delay-300">
                            <ActionCard
                                to="/postes/nuevo"
                                title="Nuevo Poste"
                                description="Registrar infraestructura"
                                icon={<MdAdd className="h-8 w-8 text-white" />}
                                gradient="from-violet-500 to-purple-600"
                            />
                            <ActionCard
                                to="/mapa"
                                title="Ver Mapa"
                                description="Explorar red geolocalizada"
                                icon={<MdMap className="h-8 w-8 text-white" />}
                            />
                            <ActionCard
                                to="/postes"
                                title="Inventario"
                                description="Gestión completa de activos"
                                icon={<MdList className="h-8 w-8 text-white" />}
                            />
                        </div>

                        {/* Recent Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up delay-400">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800">Actividad Reciente</h3>
                                <Link to="/postes" className="text-sm font-medium text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors">
                                    Ver todo →
                                </Link>
                            </div>

                            {recentPostes.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-400 mb-4">No hay actividad reciente registrada</p>
                                    <Link to="/postes/nuevo" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] transition-colors shadow-sm">
                                        <MdAdd className="mr-2 h-4 w-4" />
                                        Crear Primer Poste
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {recentPostes.map((poste) => (
                                        <Link
                                            key={poste.id}
                                            to={`/postes/${poste.id}`}
                                            className="group block px-6 py-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[var(--primary-color)] transition-colors">
                                                        {poste.nombre}
                                                    </h4>
                                                    <div className="flex items-center mt-1 space-x-2">
                                                        <span className="text-xs text-slate-500 flex items-center">
                                                            <MdCalendarToday className="inline mr-1" /> {new Date(poste.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-xs text-slate-500 truncate max-w-[200px]">
                                                            <MdPlace className="inline mr-1" /> {poste.direccion || 'Sin dirección'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <StatusBadge status={poste.estado} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Subcomponents for cleaner code
const StatCard = ({ title, value, icon, bgIcon, valueColor = "text-slate-800" }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                <h3 className={`text-3xl font-extrabold ${valueColor}`}>{value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${bgIcon}`}>
                {icon}
            </div>
        </div>
    </div>
);

const ActionCard = ({ to, title, description, icon }) => (
    <Link
        to={to}
        className="relative overflow-hidden rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-[var(--primary-color)] group"
    >
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{title}</h3>
                <p className="text-white/80 text-sm font-medium">{description}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                {icon}
            </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
    </Link>
);

const StatusBadge = ({ status }) => {
    const styles = {
        operativo: "bg-green-100 text-green-700",
        mantenimiento: "bg-amber-100 text-amber-700",
        dañado: "bg-red-100 text-red-700",
        default: "bg-slate-100 text-slate-700"
    };

    const labels = {
        operativo: "Operativo",
        mantenimiento: "Mantenimiento",
        dañado: "Dañado",
        default: status || "N/A"
    };

    const style = styles[status] || styles.default;
    const label = labels[status] || labels.default;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${style}`}>
            {label}
        </span>
    );
};

const EmptyChartState = () => (
    <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <MdWarning className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">Sin datos suficientes</p>
    </div>
);
