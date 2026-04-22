import React, { useEffect, useState } from 'react';
import { Key, Bell } from 'lucide-react';
import DirectorSidebar from './DirectorSidebar';
import LogoutModal from './LogoutModal';
import ChangePasswordModal from './ChangePasswordModal';
import CerrarTrimestreModal from './CerrarTrimestreModal';
import ConsolidadoView from './ConsolidadoView';
import InformacionGeneralView from './InformacionGeneralView';
import IngresosView from './IngresosView';
import EgresosView from './EgresosView';
import SubirPDFView from './SubirPDFView';
import { buildApiUrl } from '../config/api';

const CIERRES_API_URL = buildApiUrl('/api/movimientos/cierres');

// Función para obtener la fecha límite del trimestre seleccionado
const obtenerFechaLimite = (trimestreId, anio) => {
  switch (String(trimestreId)) {
    case '1': return new Date(anio, 3, 30, 23, 59, 59); // 30 de Abril
    case '2': return new Date(anio, 6, 31, 23, 59, 59); // 31 de Julio
    case '3': return new Date(anio, 9, 31, 23, 59, 59); // 31 de Octubre
    case '4': return new Date(anio + 1, 0, 31, 23, 59, 59); // 31 de Enero (próximo año)
    default: return new Date(anio, 11, 31, 23, 59, 59);
  }
};

const leerRespuestaJson = async (response) => {
  const rawText = await response.text();

  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    throw new Error('La respuesta del servidor no tiene un formato JSON valido.');
  }
};

const DirectorDashboard = ({ user, onLogout, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [trimestreId, setTrimestreId] = useState('1');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isCerrarTrimestreOpen, setIsCerrarTrimestreOpen] = useState(false);
  const [trimestreCerrado, setTrimestreCerrado] = useState(false);
  const [cerrandoTrimestre, setCerrandoTrimestre] = useState(false);
  const [cerradoEn, setCerradoEn] = useState(null);
  const [mensajeCierre, setMensajeCierre] = useState('');
  const [errorCierre, setErrorCierre] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const cambioObligatorioPendiente = Boolean(user?.debeCambiarPassword);

  const periodos = {
    '1': ['Enero', 'Febrero', 'Marzo'],
    '2': ['Abril', 'Mayo', 'Junio'],
    '3': ['Julio', 'Agosto', 'Septiembre'],
    '4': ['Octubre', 'Noviembre', 'Diciembre'],
  };

  const anioActual = new Date().getFullYear();
  
  // Cálculos en tiempo real para las fechas de cierre
  const fechaLimite = obtenerFechaLimite(trimestreId, anioActual);
  const ahora = new Date();
  const diferenciaMs = fechaLimite.getTime() - ahora.getTime();
  const diasRestantes = diferenciaMs > 0 ? Math.ceil(diferenciaMs / (1000 * 3600 * 24)) : 0;
  const autoCerrado = diferenciaMs <= 0;

  const esCerradoFinal = trimestreCerrado || autoCerrado;
  const mensajeCierreEfectivo = autoCerrado && !trimestreCerrado 
    ? 'Este trimestre se ha cerrado automáticamente por haber superado la fecha límite.' 
    : mensajeCierre;

  useEffect(() => {
    if (cambioObligatorioPendiente) {
      setIsChangePasswordOpen(true);
    }
  }, [cambioObligatorioPendiente]);

  useEffect(() => {
    const cargarEstadoCierre = async () => {
      if (!user.director?.id || !trimestreId || cambioObligatorioPendiente) return;

      setErrorCierre('');
      setMensajeCierre('');

      try {
        const query = new URLSearchParams({
          directorId: String(user.director.id),
          anio: String(anioActual),
          trimestreId: String(trimestreId),
        });

        const response = await fetch(`${CIERRES_API_URL}/estado?${query.toString()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await leerRespuestaJson(response);

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'No se pudo consultar el cierre del trimestre.');
        }

        setTrimestreCerrado(Boolean(data.data?.trimestreCerrado));
        setCerradoEn(data.data?.cerradoEn || null);
      } catch (loadError) {
        console.error(loadError);
        setErrorCierre(loadError.message || 'No se pudo consultar el cierre del trimestre.');
      }
    };

    cargarEstadoCierre();
  }, [anioActual, trimestreId, user.director?.id, cambioObligatorioPendiente]);

  const handleCerrarTrimestre = async () => {
    if (trimestreCerrado || !user.director?.id || cambioObligatorioPendiente) return;

    setCerrandoTrimestre(true);
    setErrorCierre('');
    setMensajeCierre('');

    try {
      const response = await fetch(CIERRES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          directorId: user.director.id,
          anio: anioActual,
          trimestreId,
        }),
      });

      const data = await leerRespuestaJson(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No se pudo cerrar el trimestre.');
      }

      setTrimestreCerrado(true);
      setCerradoEn(data.data?.cerradoEn || new Date().toISOString());
      setMensajeCierre('El trimestre fue cerrado y ya no admite cambios.');
      setIsCerrarTrimestreOpen(false);
    } catch (closeError) {
      console.error(closeError);
      setErrorCierre(closeError.message || 'No se pudo cerrar el trimestre.');
    } finally {
      setCerrandoTrimestre(false);
    }
  };

  const handlePasswordChanged = (updatedUser) => {
    setIsChangePasswordOpen(false);

    if (updatedUser) {
      onUserUpdate?.(updatedUser);
    } else {
      onUserUpdate?.({ ...user, debeCambiarPassword: false });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DirectorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />

      <main className="flex-1 overflow-y-auto p-10">
        <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">
              Panel de Director: {user.director?.school || 'N/A'}
            </h1>
            {cambioObligatorioPendiente && (
              <p className="text-sm text-amber-700 mt-1">
                Debes cambiar tu contrasena temporal antes de usar el sistema.
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <select
              value={trimestreId}
              onChange={(e) => setTrimestreId(e.target.value)}
              disabled={cambioObligatorioPendiente}
              className="bg-blue-50 border border-blue-200 text-blue-700 py-2 px-4 rounded-lg font-bold outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            >
              <option value="1">1er Trimestre</option>
              <option value="2">2do Trimestre</option>
              <option value="3">3er Trimestre</option>
              <option value="4">4to Trimestre</option>
            </select>
            
            {/* Dropdown de Notificaciones y Alertas de Plazos */}
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors focus:outline-none"
                title="Notificaciones"
              >
                <Bell size={22} />
                {diasRestantes > 0 && diasRestantes <= 15 && !trimestreCerrado && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800">Alertas del Sistema</h3>
                  </div>
                  <div className="p-4">
                    {autoCerrado ? (
                      <div className="flex gap-3">
                        <div className="mt-0.5 text-red-500"><Bell size={18} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Trimestre Finalizado</p>
                          <p className="text-xs text-slate-500 mt-1">El plazo venció el {fechaLimite.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
                          <p className="text-xs font-bold text-red-600 mt-2">Sistema bloqueado automáticamente.</p>
                        </div>
                      </div>
                    ) : trimestreCerrado ? (
                      <div className="flex gap-3">
                        <div className="mt-0.5 text-emerald-500"><Bell size={18} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Trimestre Cerrado</p>
                          <p className="text-xs text-slate-500 mt-1">Has cerrado este trimestre manualmente. Todo está en orden.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="mt-0.5 text-amber-500"><Bell size={18} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Aviso de Cierre Próximo</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Tienes hasta el <span className="font-bold">{fechaLimite.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</span> a las 11:59 PM para declarar tus sustentos.
                          </p>
                          <p className={`text-xs font-bold mt-2 ${diasRestantes <= 5 ? 'text-red-600' : 'text-amber-600'}`}>
                            ⏳ Te quedan {diasRestantes} días.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm"
              title="Cambiar contraseña"
            >
              <Key size={18} />
              Cambiar Clave
            </button>
          </div>
        </div>

        {cambioObligatorioPendiente ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-900">
            <h2 className="text-lg font-bold mb-2">Cambio de contrasena pendiente</h2>
            <p>
              Ya ingresaste con la clave temporal. Antes de continuar, registra una nueva
              contrasena personal para completar tu primer acceso.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'general' && (
              <ConsolidadoView
                trimestreId={trimestreId}
                directorId={user.director?.id}
                schoolName={user.director?.school}
                trimestreCerrado={esCerradoFinal}
                cerrandoTrimestre={cerrandoTrimestre}
                mensajeCierre={mensajeCierreEfectivo}
                errorCierre={errorCierre}
                cerradoEn={cerradoEn}
                onCerrarTrimestre={() => setIsCerrarTrimestreOpen(true)}
              />
            )}

            {activeTab === 'ingresos' && (
              <IngresosView
                trimestreMeses={periodos[trimestreId]}
                trimestreId={trimestreId}
                directorId={user.director?.id}
                trimestreCerrado={esCerradoFinal}
                schoolName={user.director?.school}
              />
            )}

            {activeTab === 'egresos' && (
              <EgresosView
                trimestreMeses={periodos[trimestreId]}
                trimestreId={trimestreId}
                directorId={user.director?.id}
                trimestreCerrado={esCerradoFinal}
                schoolName={user.director?.school}
              />
            )}

            {activeTab === 'facturas' && (
              <SubirPDFView
                trimestreMeses={periodos[trimestreId]}
                trimestreId={trimestreId}
                directorId={user.director?.id}
                trimestreCerrado={esCerradoFinal}
              />
            )}

            {activeTab === 'informacion' && <InformacionGeneralView director={user.director} />}
          </>
        )}

        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={onLogout}
        />

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => {
            if (!cambioObligatorioPendiente) {
              setIsChangePasswordOpen(false);
            }
          }}
          mode={cambioObligatorioPendiente ? 'required' : 'optional'}
          onPasswordChanged={handlePasswordChanged}
        />

        <CerrarTrimestreModal
          isOpen={isCerrarTrimestreOpen}
          onClose={() => {
            if (!cerrandoTrimestre) setIsCerrarTrimestreOpen(false);
          }}
          onConfirm={handleCerrarTrimestre}
          loading={cerrandoTrimestre}
        />
      </main>
    </div>
  );
};

export default DirectorDashboard;
