import { useState, useEffect } from 'react';
import { Navbar } from '../common/Navbar';
import { Loader } from '../common/Loader';
import api from '../../services/api';
import { MdDownload, MdFilterList, MdBarChart, MdPictureAsPdf, MdTableChart } from 'react-icons/md';

export const ReportGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        estado: '',
        material: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const response = await api.get('/reportes/stats');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDownloadPDF = async () => {
        try {
            setLoading(true);

            // Construir query params
            const params = new URLSearchParams();
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.material) params.append('material', filters.material);
            if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
            if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

            // Descargar PDF
            const response = await api.get(`/reportes/pdf?${params.toString()}`, {
                responseType: 'blob'
            });

            // Crear link de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte-postes-${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            console.error('Error al descargar PDF:', error);
            alert('Error al generar el reporte PDF');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            setLoading(true);

            // Construir query params
            const params = new URLSearchParams();
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.material) params.append('material', filters.material);
            if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
            if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

            // Descargar Excel
            const response = await api.get(`/reportes/excel?${params.toString()}`, {
                responseType: 'blob'
            });

            // Crear link de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte-postes-${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            console.error('Error al descargar Excel:', error);
            alert('Error al generar el reporte Excel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <MdBarChart className="mr-3 text-blue-600" />
                            Reportes y Estadísticas
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Genera reportes en PDF o Excel con filtros personalizados
                        </p>
                    </div>

                    {/* Estadísticas Generales */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Total de Postes</h3>
                                <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Altura Promedio</h3>
                                <p className="text-4xl font-bold text-green-600">{stats.altura_promedio}m</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Estados Registrados</h3>
                                <p className="text-4xl font-bold text-purple-600">
                                    {Object.keys(stats.por_estado).length}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Distribución por Estado */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Distribución por Estado
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.por_estado).map(([estado, count]) => (
                                        <div key={estado} className="flex items-center justify-between">
                                            <span className="text-gray-700 capitalize">{estado}</span>
                                            <div className="flex items-center">
                                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(count / stats.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                                                    {count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Distribución por Material
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.por_material).map(([material, count]) => (
                                        <div key={material} className="flex items-center justify-between">
                                            <span className="text-gray-700 capitalize">{material}</span>
                                            <div className="flex items-center">
                                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${(count / stats.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                                                    {count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Generador de Reportes */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <MdFilterList className="mr-2 text-blue-600" />
                            Generar Reporte Personalizado
                        </h2>

                        {/* Filtros */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    name="estado"
                                    value={filters.estado}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="operativo">Operativo</option>
                                    <option value="mantenimiento">En Mantenimiento</option>
                                    <option value="dañado">Dañado</option>
                                    <option value="fuera_servicio">Fuera de Servicio</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Material
                                </label>
                                <select
                                    name="material"
                                    value={filters.material}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="concreto">Concreto</option>
                                    <option value="madera">Madera</option>
                                    <option value="metal">Metal</option>
                                    <option value="fibra_vidrio">Fibra de Vidrio</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={filters.fecha_inicio}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={filters.fecha_fin}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Botones de Descarga */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={loading}
                                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <MdPictureAsPdf className="mr-2 text-xl" />
                                {loading ? 'Generando...' : 'Descargar PDF'}
                            </button>

                            <button
                                onClick={handleDownloadExcel}
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <MdTableChart className="mr-2 text-xl" />
                                {loading ? 'Generando...' : 'Descargar Excel'}
                            </button>
                        </div>

                        {/* Información */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Tip:</strong> Los reportes incluyen todos los postes que coincidan con los filtros seleccionados.
                                Si no seleccionas ningún filtro, se generará un reporte con todos los postes registrados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
