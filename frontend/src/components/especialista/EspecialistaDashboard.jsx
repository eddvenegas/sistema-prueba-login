import React, { useState, useEffect } from 'react';
import { Search, Folder, LogOut, LayoutDashboard, FileText, Settings, User, Calendar, Loader2, AlertCircle, PieChart, Download, CheckCircle2, Clock, Building2, Inbox, Shield, Mail, Key, Moon, BellRing } from 'lucide-react';
import ColegioDetalle from './ColegioDetalle';
import ExcelJS from 'exceljs';
import ChangePasswordModal from '../ChangePasswordModal';

const EspecialistaDashboard = ({ user, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('explorador'); // 'explorador' | 'reportes' | 'configuracion'
  
  // Estado para controlar si estamos viendo un colegio en específico
  const [selectedColegio, setSelectedColegio] = useState(null);

  // Estado para el selector del trimestre actual
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState('1');

  // Estados para obtener la data del backend
  const [colegios, setColegios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Efecto para buscar los colegios cada vez que cambie el trimestre
  useEffect(() => {
    const fetchColegios = async () => {
      setLoading(true);
      setError(null);
      try {
        const anio = new Date().getFullYear();
        const response = await fetch(`http://localhost:5000/api/especialista/colegios?trimestre=${trimestreSeleccionado}&anio=${anio}`);
        const data = await response.json();
        
        if (data.success) {
          setColegios(data.colegios);
        } else {
          setError(data.message || 'Error al cargar colegios');
        }
      } catch (err) {
        console.error("Error al conectar con la API:", err);
        setError('No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchColegios();
  }, [trimestreSeleccionado]);

  // Filtro de búsqueda en tiempo real
  const filteredColegios = colegios.filter(c => 
    (c.nombre && c.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.codigoModular && c.codigoModular.includes(searchTerm))
  );

  // Función para generar y descargar el Excel Global
  const handleExportarGlobal = async () => {
    try {
      setIsExporting(true);
      const anio = new Date().getFullYear();
      const response = await fetch(`http://localhost:5000/api/especialista/reporte-global?trimestre=${trimestreSeleccionado}&anio=${anio}`);
      const data = await response.json();

      if (!data.success) {
        alert('Error al obtener los datos del reporte');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Reporte T${trimestreSeleccionado} ${anio}`);

      // Definir las columnas y sus formatos
      worksheet.columns = [
        { header: 'Código Modular', key: 'codigoModular', width: 18 },
        { header: 'Institución Educativa', key: 'nombre', width: 45 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Total Ingresos (S/)', key: 'ingresos', width: 22, style: { numFmt: '"S/"#,##0.00' } },
        { header: 'Total Egresos (S/)', key: 'egresos', width: 22, style: { numFmt: '"S/"#,##0.00' } },
        { header: 'Saldo Final (S/)', key: 'saldo', width: 22, style: { numFmt: '"S/"#,##0.00' } }
      ];

      // Añadir la data
      data.reporte.forEach(item => {
        worksheet.addRow({
          codigoModular: item.codigoModular,
          nombre: item.nombre,
          estado: item.estado,
          ingresos: Number(item.totalIngresos),
          egresos: Number(item.totalEgresos),
          saldo: Number(item.saldoFinal)
        });
      });

      // Estilos Premium: Cabecera azul y texto blanco
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Congelar la primera fila
      worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

      // Generar el archivo y forzar descarga en el navegador
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Global_UGEL_T${trimestreSeleccionado}_${anio}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando Excel:', err);
      alert('Ocurrió un error al generar el archivo Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  // Cálculos para los gráficos (PowerBI Style)
  const stats = {
    total: colegios.length,
    subidos: colegios.filter(c => c.estado !== 'Borrador').length,
    enviados: colegios.filter(c => c.estado === 'Enviado').length,
    aprobados: colegios.filter(c => c.estado === 'Aprobado').length,
    observados: colegios.filter(c => c.estado === 'Observado').length,
    borradores: colegios.filter(c => c.estado === 'Borrador').length,
  };
  const pctSubidos = stats.total > 0 ? Math.round((stats.subidos / stats.total) * 100) : 0;
  const pctAprobados = stats.subidos > 0 ? Math.round((stats.aprobados / stats.subidos) * 100) : 0;
  const pctObservados = stats.subidos > 0 ? Math.round((stats.observados / stats.subidos) * 100) : 0;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Menú Lateral (Sidebar) - Azul Oscuro */}
      <aside className="w-64 bg-blue-950 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-blue-900/50">
          <h2 className="text-xl font-bold text-blue-200">UGEL Panel</h2>
          <p className="text-xs text-blue-400 mt-1">Supervisión y Auditoría</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setActiveView('explorador'); setSelectedColegio(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors shadow-sm ${activeView === 'explorador' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-900/50 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Explorador</span>
          </button>
          <button 
            onClick={() => { setActiveView('reportes'); setSelectedColegio(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors shadow-sm ${activeView === 'reportes' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-900/50 hover:text-white'}`}
          >
            <PieChart size={20} />
            <span className="font-medium">Estadísticas</span>
          </button>
          <button 
            onClick={() => { setActiveView('configuracion'); setSelectedColegio(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors shadow-sm ${activeView === 'configuracion' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-900/50 hover:text-white'}`}
          >
            <Settings size={20} />
            <span className="font-medium">Configuración</span>
          </button>
        </nav>

        {/* Zona inferior del usuario */}
        <div className="p-4 border-t border-blue-900/50 bg-blue-950">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center border-2 border-blue-600">
              <User size={20} className="text-blue-200" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.nombre || 'Especialista'}</p>
              <p className="text-xs text-blue-400 truncate text-ellipsis">UGEL Sede</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-medium"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'reportes' ? (
          /* --- VISTA DE REPORTES Y ESTADÍSTICAS --- */
          <>
            <header className="bg-white shadow-sm px-8 py-5 flex items-center justify-between z-10 border-b border-slate-200">
              <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold text-slate-800">Reportes y Estadísticas</h1>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <Calendar size={18} className="text-blue-500" />
                  <select 
                    className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                    value={trimestreSeleccionado}
                    onChange={(e) => setTrimestreSeleccionado(e.target.value)}
                  >
                    <option value="1">1er Trimestre (Ene - Mar)</option>
                    <option value="2">2do Trimestre (Abr - Jun)</option>
                    <option value="3">3er Trimestre (Jul - Sep)</option>
                    <option value="4">4to Trimestre (Oct - Dic)</option>
                  </select>
                </div>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Tarjetas Kpis */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Total Colegios</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Recibidos Totales</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.subidos}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Inbox size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-amber-600 font-bold">Por Revisar</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.enviados}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">En Borrador</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.borradores}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Circular Chart 1 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 mb-6">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                        <circle className="text-indigo-500 transition-all duration-1000 ease-out" strokeWidth="10" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (pctSubidos / 100) * (2 * Math.PI * 40)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span className="text-2xl font-bold text-slate-700">{pctSubidos}%</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Avance de Envíos</h3>
                    <p className="text-sm text-slate-500 mt-1">Instituciones que ya enviaron su declaración ({stats.subidos} de {stats.total}).</p>
                  </div>

                  {/* Circular Chart 2 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 mb-6">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                        <circle className="text-emerald-500 transition-all duration-1000 ease-out" strokeWidth="10" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (pctAprobados / 100) * (2 * Math.PI * 40)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span className="text-2xl font-bold text-slate-700">{pctAprobados}%</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Tasa de Aprobación</h3>
                    <p className="text-sm text-slate-500 mt-1">Reportes enviados que ya fueron aprobados ({stats.aprobados} de {stats.subidos}).</p>
                  </div>

                  {/* Circular Chart 3 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 mb-6">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                        <circle className="text-rose-500 transition-all duration-1000 ease-out" strokeWidth="10" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (pctObservados / 100) * (2 * Math.PI * 40)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span className="text-2xl font-bold text-slate-700">{pctObservados}%</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Índice de Observaciones</h3>
                    <p className="text-sm text-slate-500 mt-1">Reportes enviados que presentaron inconsistencias ({stats.observados} de {stats.subidos}).</p>
                  </div>
                </div>

                {/* Banner de Exportación de Excel Maestro */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-950 p-8 md:p-10 rounded-2xl shadow-md text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden mt-6">
                  <div className="absolute -right-12 -top-24 text-blue-800/30">
                    <FileText size={250} />
                  </div>
                  <div className="relative z-10 mb-6 md:mb-0 md:pr-8 text-center md:text-left flex-1">
                    <h3 className="text-2xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3">
                      <Download className="text-blue-300" size={28} />
                      Reporte Consolidado Financiero
                    </h3>
                    <p className="text-blue-100 text-sm md:text-base max-w-3xl leading-relaxed">
                      Descarga la sábana de datos maestra en formato Excel (.xlsx). Incluye el estado actual de auditoría, totales declarados de ingresos y egresos, y el saldo final bancario de todas las instituciones educativas de la jurisdicción.
                    </p>
                  </div>
                  <div className="relative z-10 w-full md:w-auto flex-shrink-0">
                    <button 
                      onClick={handleExportarGlobal}
                      disabled={isExporting}
                      className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isExporting ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24} />}
                      {isExporting ? 'Generando Archivo...' : 'Exportar a Excel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeView === 'configuracion' ? (
          /* --- VISTA DE CONFIGURACIÓN --- */
          <>
            <header className="bg-white shadow-sm px-8 py-5 flex items-center justify-between z-10 border-b border-slate-200">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Settings className="text-blue-600" size={28} />
                Configuración de Cuenta
              </h1>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Tarjeta de Perfil */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                    <User className="text-slate-400" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">Perfil Personal</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-1">Nombre Completo</label>
                      <p className="text-slate-800 font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">{user?.nombre || 'Especialista UGEL'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-1">Correo Electrónico</label>
                      <p className="text-slate-800 font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        {user?.email || 'especialista@ugel.edu.pe'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-1">Rol en el Sistema</label>
                      <p className="text-blue-700 font-bold bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-200 inline-block">
                        Auditor / Especialista
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Seguridad */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                    <Shield className="text-slate-400" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">Seguridad y Acceso</h2>
                  </div>
                  <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-700">Contraseña de acceso</h3>
                      <p className="text-sm text-slate-500 mt-1 max-w-md">Te recomendamos cambiar tu contraseña periódicamente para mantener la seguridad de las auditorías.</p>
                    </div>
                    <button 
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-sm"
                    >
                      <Key size={18} />
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>

                {/* Tarjeta de Preferencias */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                    <Settings className="text-slate-400" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">Preferencias de Interfaz</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Moon size={20} /></div>
                        <div>
                          <p className="font-bold text-slate-700">Modo Oscuro</p>
                          <p className="text-xs text-slate-500">Cambia la apariencia del panel a colores oscuros.</p>
                        </div>
                      </div>
                      <div className="bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Próximamente</div>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><BellRing size={20} /></div>
                        <div>
                          <p className="font-bold text-slate-700">Notificaciones por Correo</p>
                          <p className="text-xs text-slate-500">Recibir un email cuando un director envíe un reporte.</p>
                        </div>
                      </div>
                      <div className="bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Próximamente</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : selectedColegio ? (
          /* --- VISTA DE DETALLE DEL COLEGIO --- */
          <ColegioDetalle 
            colegio={selectedColegio} 
            onBack={() => setSelectedColegio(null)} 
            trimestre={trimestreSeleccionado}
          />
        ) : (
          /* --- VISTA DEL EXPLORADOR (CARPETAS) --- */
          <>
            <header className="bg-white shadow-sm px-8 py-5 flex items-center justify-between z-10 border-b border-slate-200">
              <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold text-slate-800">Colegios Asignados</h1>
                
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <Calendar size={18} className="text-blue-500" />
                  <select 
                    className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                    value={trimestreSeleccionado}
                    onChange={(e) => setTrimestreSeleccionado(e.target.value)}
                  >
                    <option value="1">1er Trimestre (Ene - Mar)</option>
                    <option value="2">2do Trimestre (Abr - Jun)</option>
                    <option value="3">3er Trimestre (Jul - Sep)</option>
                    <option value="4">4to Trimestre (Oct - Dic)</option>
                  </select>
                </div>
              </div>
              
              <div className="relative w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar por código o nombre..." 
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all text-sm font-medium shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                  <Loader2 size={40} className="animate-spin text-blue-500" />
                  <p className="font-medium">Cargando colegios desde la UGEL...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-rose-500 gap-3">
                  <AlertCircle size={48} className="text-rose-400" />
                  <p className="font-bold">{error}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredColegios.map((colegio) => (
                      <div 
                        key={colegio.id}
                        onClick={() => setSelectedColegio(colegio)}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center group"
                      >
                        <Folder 
                          size={72} 
                          className="mb-3 text-blue-400 group-hover:text-blue-500 transition-colors" 
                          fill="currentColor"
                          fillOpacity={0.2}
                          strokeWidth={1.5}
                        />
                        <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight text-sm mb-1">{colegio.nombre}</h3>
                        <p className="text-xs text-slate-500 font-mono mb-3 bg-slate-100 px-2 py-0.5 rounded">{colegio.codigoModular}</p>
                        
                        <div className={`mt-auto w-full py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase ${
                          colegio.estado === 'Aprobado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                          colegio.estado === 'Observado' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                          colegio.estado === 'Enviado' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                          colegio.estado === 'Borrador' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {colegio.estado}
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredColegios.length === 0 && (
                    <div className="text-center py-20 text-slate-500 flex flex-col items-center">
                      <div className="bg-slate-100 p-6 rounded-full mb-4">
                        <Folder size={48} className="text-slate-300" />
                      </div>
                      <p className="text-lg font-medium text-slate-700">No se encontraron colegios</p>
                      <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          mode="optional"
        />
      </main>
    </div>
  );
};

export default EspecialistaDashboard;