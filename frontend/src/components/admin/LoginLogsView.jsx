import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, Search } from 'lucide-react';
import { buildApiUrl } from '../../config/api'; // Ajusta la ruta si es necesario

const LoginLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/login-logs'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        setError(data.message || 'Error al obtener los registros.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de red al intentar conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    (log.email && log.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.ip_address && log.ip_address.includes(searchTerm)) ||
    (log.user_agent && log.user_agent.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (new Date(log.fecha_hora).toLocaleString('es-PE').includes(searchTerm))
  );

  if (loading) return <div className="flex-1 flex justify-center items-center p-8 text-slate-500 font-medium">Cargando registros de sesión...</div>;
  if (error) return <div className="flex-1 flex justify-center items-center p-8 text-rose-500 font-bold">{error}</div>;

  return (
    <>
      <header className="bg-white shadow-sm px-8 py-5 flex items-center justify-between z-10 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Key className="text-blue-600" size={28} />
          Logs de Inicio de Sesión
        </h1>
        
        <button 
          onClick={fetchLogs} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
        >
          <RefreshCw size={18} />
          Refrescar
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Barra de Búsqueda */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por usuario, IP o fecha..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Fecha y Hora</th>
                    <th className="p-4 font-bold">Usuario / Email</th>
                    <th className="p-4 font-bold text-center">Estado</th>
                    <th className="p-4 font-bold">Detalle</th>
                    <th className="p-4 font-bold">Dirección IP</th>
                    <th className="p-4 font-bold">Navegador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No se encontraron registros que coincidan con la búsqueda.</td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{new Date(log.fecha_hora).toLocaleString('es-PE')}</td>
                        <td className="p-4 text-sm font-bold text-slate-800">{log.email}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${log.exitoso ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                            {log.exitoso ? 'Exitoso' : 'Fallido'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{log.razon_fallo || '-'}</td>
                        <td className="p-4 text-sm font-mono text-slate-600">{log.ip_address || 'Desconocida'}</td>
                        <td className="p-4 text-sm text-slate-500 truncate max-w-xs" title={log.user_agent}>{log.user_agent}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginLogsView;