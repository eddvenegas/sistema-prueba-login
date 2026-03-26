import React, { useState } from 'react';
import DirectorSidebar from './DirectorSidebar';
import LogoutModal from './LogoutModal';
import InformeGeneralView from './InformeGeneralView';
import IngresosView from './IngresosView';
import EgresosView from './EgresosView';
import SubirFacturasView from './SubirFacturasView';

const DirectorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [trimestreId, setTrimestreId] = useState('1');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const periodos = {
    '1': ['Enero', 'Febrero', 'Marzo'],
    '2': ['Abril', 'Mayo', 'Junio'],
    '3': ['Julio', 'Agosto', 'Septiembre'],
    '4': ['Octubre', 'Noviembre', 'Diciembre'],
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* DirectorSidebar es hijo de DirectorDashboard */}
      <DirectorSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-10">
        {/* SELECTOR GLOBAL */}
        <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Panel de Director: {user.school}</h1>
          
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
        </div>

        {/* CONTENIDO DINÁMICO - InformeGeneralView e IngresosView son hijos */}
        {activeTab === 'general' && (
          <InformeGeneralView trimestreMeses={periodos[trimestreId]} />
        )}
        
        {activeTab === 'ingresos' && (
          <IngresosView trimestreMeses={periodos[trimestreId]} />
        )}

      {/* LogoutModal conectado */}
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
      />

        {activeTab === 'egresos' && <EgresosView trimestreMeses={periodos[trimestreId]} />}
        {activeTab === 'facturas' && <SubirFacturasView trimestreMeses={periodos[trimestreId]} />}
      </main>
    </div>
  );
};

export default DirectorDashboard;