import React, { useState } from 'react';
import { LayoutDashboard, FolderOpen, UploadCloud, LogOut, Settings, Key, Moon, HelpCircle } from 'lucide-react';

const DirectorSidebar = ({ activeTab, setActiveTab, onLogoutClick, onChangePasswordClick }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Las opciones de tu menú actual
  const menuItems = [
    { id: 'general', label: 'CONSOLIDADO', icon: <LayoutDashboard size={18} /> },
    { id: 'ingresos', label: 'INGRESOS', icon: <FolderOpen size={18} /> },
    { id: 'egresos', label: 'EGRESOS', icon: <FolderOpen size={18} /> },
    { id: 'facturas', label: 'SUBIR PDF', icon: <UploadCloud size={18} /> },
    { id: 'informacion', label: 'INFORMACIÓN GENERAL', icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <aside className="w-64 bg-white h-full border-r border-gray-100 flex flex-col p-6">
      {/* Header con Logo Institucional */}
      <div className="mb-10 text-center">
        {/* Aquí iría el logo real */}
        <div className="bg-gray-200 h-10 w-24 mx-auto rounded flex items-center justify-center">
          <img 
            src="https://ugelsanta.gob.pe/wp-content/uploads/2026/02/Logo_US3.png" 
            alt="Logo UGEL" 
            className="h-16 w-auto object-contain" 
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Logo+UGEL' }}
          />
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-lg text-sm text-left transition-colors ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Sección Inferior - Cerrar Sesión */}
      <div className="border-t border-gray-100 pt-5 mt-auto relative">
        
        {/* Popover de Configuración */}
        {isSettingsOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50">
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  onChangePasswordClick();
                  setIsSettingsOpen(false);
                }}
                className="w-full flex items-center justify-start space-x-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-700 hover:bg-slate-50 transition-colors"
              >
                <Key size={16} className="text-slate-500" />
                <span>Cambiar Contraseña</span>
              </button>
              <button
                onClick={() => {
                  alert("El Modo Oscuro estará disponible próximamente.");
                  setIsSettingsOpen(false);
                }}
                className="w-full flex items-center justify-start space-x-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-700 hover:bg-slate-50 transition-colors"
              >
                <Moon size={16} className="text-slate-500" />
                <span>Tema: Claro</span>
              </button>
              <button
                onClick={() => {
                  alert("SOPORTE TÉCNICO UGEL\n\n📞 Teléfono: (043) 314615 - Anexo 102\n✉️ Correo: soporte.sistemas@ugel.edu.pe\n🕒 Horario: Lunes a Viernes de 8:00 AM a 5:00 PM\n\nComunícate con nosotros si tienes problemas para subir tus sustentos o cambiar tu contraseña.");
                  setIsSettingsOpen(false);
                }}
                className="w-full flex items-center justify-start space-x-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-700 hover:bg-slate-50 transition-colors border-t border-gray-100 mt-1 pt-2.5"
              >
                <HelpCircle size={16} className="text-slate-500" />
                <span>Soporte Técnico</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-lg text-sm text-left transition-colors mb-1 ${
            isSettingsOpen ? 'bg-slate-100 text-slate-800 font-medium' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Settings size={18} />
          <span>Configuración</span>
        </button>

        <button 
          onClick={onLogoutClick}
          className="w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-lg text-sm text-left text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default DirectorSidebar;
