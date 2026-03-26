import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

const IngresosView = ({ trimestreMeses }) => {
  // 1. Estado para saber qué mes estamos editando
  const [mesActivo, setMesActivo] = useState(0); 

  // 2. Estado para los datos de las tablas (un array por cada mes)
  const [datosMeses, setDatosMeses] = useState([
    [{ id: 1, fecha: '', tipo: '', numero: '', concepto: '', importe: 0 }], // Mes 1
    [{ id: 1, fecha: '', tipo: '', numero: '', concepto: '', importe: 0 }], // Mes 2
    [{ id: 1, fecha: '', tipo: '', numero: '', concepto: '', importe: 0 }]  // Mes 3
  ]);

  // Función para manejar cambios en los inputs
  const handleInputChange = (mesIndex, filaId, campo, valor) => {
    const nuevosDatos = [...datosMeses];
    nuevosDatos[mesIndex] = nuevosDatos[mesIndex].map(fila => 
      fila.id === filaId ? { ...fila, [campo]: valor } : fila
    );
    setDatosMeses(nuevosDatos);
  };

  // Función para agregar fila
  const agregarFila = (mesIndex) => {
    const nuevosDatos = [...datosMeses];
    const nuevaFila = { 
      id: Date.now(), 
      fecha: '', tipo: '', numero: '', concepto: '', importe: 0 
    };
    nuevosDatos[mesIndex] = [...nuevosDatos[mesIndex], nuevaFila];
    setDatosMeses(nuevosDatos);
  };

  // Calcular total del mes actual
  const calcularTotal = (mesIndex) => {
    return datosMeses[mesIndex].reduce((sum, fila) => sum + parseFloat(fila.importe || 0), 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* NAVEGACIÓN DE MESES */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        {trimestreMeses.map((mes, index) => (
          <button
            key={mes}
            onClick={() => setMesActivo(index)}
            className={`px-8 py-4 text-sm font-bold transition-all ${
              mesActivo === index 
              ? 'bg-white text-blue-600 border-t-4 border-t-blue-600 shadow-sm' 
              : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            {mes.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 italic underline">RELACIÓN DE INGRESOS - {trimestreMeses[mesActivo].toUpperCase()}</h2>
          <button 
            onClick={() => agregarFila(mesActivo)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-all shadow-md"
          >
            <Plus size={18} /> Agregar Fila
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 w-10">N°</th>
                <th className="border border-gray-300 p-2 w-24">Fecha</th>
                <th className="border border-gray-300 p-2 w-32">Tipo de Comprob.</th>
                <th className="border border-gray-300 p-2 w-32">Número Comprob.</th>
                <th className="border border-gray-300 p-2">Concepto</th>
                <th className="border border-gray-300 p-2 w-32">Importe</th>
              </tr>
            </thead>
            <tbody>
              {datosMeses[mesActivo].map((fila, index) => (
                <tr key={fila.id} className="hover:bg-blue-50/30">
                  <td className="border border-gray-300 p-2 text-center bg-gray-50">{index + 1}</td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" value={fila.fecha} onChange={(e) => handleInputChange(mesActivo, fila.id, 'fecha', e.target.value)} className="w-full p-1 outline-none bg-transparent" placeholder="DD-MM" />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" value={fila.tipo} onChange={(e) => handleInputChange(mesActivo, fila.id, 'tipo', e.target.value)} className="w-full p-1 outline-none bg-transparent" />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" value={fila.numero} onChange={(e) => handleInputChange(mesActivo, fila.id, 'numero', e.target.value)} className="w-full p-1 outline-none bg-transparent" />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input type="text" value={fila.concepto} onChange={(e) => handleInputChange(mesActivo, fila.id, 'concepto', e.target.value)} className="w-full p-1 outline-none bg-transparent" />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input 
                      type="number" 
                      value={fila.importe} 
                      onChange={(e) => handleInputChange(mesActivo, fila.id, 'importe', e.target.value)} 
                      className="w-full p-1 outline-none bg-transparent text-right font-mono"
                    />
                  </td>
                </tr>
              ))}
              {/* FILA DE TOTAL */}
              <tr className="bg-gray-50 font-bold">
                <td colSpan="5" className="border border-gray-300 p-2 text-right uppercase tracking-wider">Total</td>
                <td className="border border-gray-300 p-2 text-right text-blue-700 font-mono text-lg">
                  {new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2 }).format(calcularTotal(mesActivo))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg">
            <Save size={20} /> Guardar Mes Actual
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngresosView;