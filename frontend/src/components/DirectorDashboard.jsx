import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import DirectorSidebar from './DirectorSidebar';
import LogoutModal from './LogoutModal';
import ChangePasswordModal from './ChangePasswordModal';
import ConsolidadoView from './ConsolidadoView';
import InformeGeneralView from './InformeGeneralView';
import IngresosView from './IngresosView';
import EgresosView from './EgresosView';
import SubirFacturasView from './SubirFacturasView';

const DirectorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [trimestreId, setTrimestreId] = useState('1');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const periodos = {
    '1': ['Enero', 'Febrero', 'Marzo'],
    '2': ['Abril', 'Mayo', 'Junio'],
    '3': ['Julio', 'Agosto', 'Septiembre'],
    '4': ['Octubre', 'Noviembre', 'Diciembre'],
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
          <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Panel de Director: {user.director?.school || 'N/A'}</h1>

          <div className="flex items-center gap-4">
            <select
              value={trimestreId}
              onChange={(e) => setTrimestreId(e.target.value)}
              className="bg-blue-50 border border-blue-200 text-blue-700 py-2 px-4 rounded-lg font-bold outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="1">1er Trimestre</option>
              <option value="2">2do Trimestre</option>
              <option value="3">3er Trimestre</option>
              <option value="4">4to Trimestre</option>
            </select>
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              title="Cambiar contrasena"
            >
              <Settings size={20} />
              Configuracion
            </button>
          </div>
        </div>

        {activeTab === 'general' && (
          <ConsolidadoView trimestreId={trimestreId} schoolName={user.director?.school} />
        )}

        {activeTab === 'ingresos' && (
          <IngresosView
            trimestreMeses={periodos[trimestreId]}
            trimestreId={trimestreId}
            directorId={user.director?.id}
          />
        )}

        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={onLogout}
        />

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          userEmail={user.email}
        />

        {activeTab === 'egresos' && (
          <EgresosView
            trimestreMeses={periodos[trimestreId]}
            trimestreId={trimestreId}
            directorId={user.director?.id}
          />
        )}
        {activeTab === 'facturas' && <SubirFacturasView trimestreMeses={periodos[trimestreId]} />}
        {activeTab === 'informe' && <InformeGeneralView director={user.director} />}
      </main>
    </div>
  );
};

export default DirectorDashboard;
