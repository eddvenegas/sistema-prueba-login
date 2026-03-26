import React, { useState } from 'react';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const SubirFacturasView = ({ trimestreMeses }) => {
  const [archivos, setArchivos] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(trimestreMeses[0]);

  // Simular la subida de archivos
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const nuevosArchivos = files.map(file => ({
      id: Date.now() + Math.random(),
      nombre: file.name,
      tamano: (file.size / 1024).toFixed(2) + ' KB',
      mes: mesSeleccionado,
      estado: 'Subido'
    }));
    setArchivos([...archivos, ...nuevosArchivos]);
  };

  const eliminarArchivo = (id) => {
    setArchivos(archivos.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sustentos de Gasto</h2>
        <p className="text-gray-500 mb-8">Sube las facturas, boletas o recibos digitalizados para respaldar tu informe.</p>

        {/* Selector de Mes para la Factura */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">¿A qué mes corresponde este comprobante?</label>
          <div className="flex gap-2">
            {trimestreMeses.map(mes => (
              <button
                key={mes}
                onClick={() => setMesSeleccionado(mes)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mesSeleccionado === mes 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {mes}
              </button>
            ))}
          </div>
        </div>

        {/* Zona de Drop principal */}
        <label className="group flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <p className="mb-2 text-sm text-gray-700 font-semibold">Haz clic para subir o arrastra y suelta</p>
            <p className="text-xs text-gray-400 uppercase">PDF, PNG o JPG (Máx. 10MB por archivo)</p>
          </div>
          <input type="file" className="hidden" multiple onChange={handleFileUpload} />
        </label>
      </div>

      {/* Lista de Archivos Subidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between">
          <h3 className="font-bold text-gray-700">Archivos cargados ({archivos.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {archivos.length === 0 ? (
            <div className="p-10 text-center text-gray-400 flex flex-col items-center">
              <AlertCircle size={40} className="mb-2 opacity-20" />
              <p>No hay documentos cargados para este trimestre.</p>
            </div>
          ) : (
            archivos.map(archivo => (
              <div key={archivo.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{archivo.nombre}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{archivo.tamano}</span>
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{archivo.mes}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircle size={14} /> Listo
                  </span>
                  <button 
                    onClick={() => eliminarArchivo(archivo.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botón Final de Envío */}
      <div className="flex justify-end pt-4">
        <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-3">
          Finalizar y Enviar Informe Completo
        </button>
      </div>
    </div>
  );
};

export default SubirFacturasView;