import React, { useState, useEffect } from 'react';
import { Plus, Save, CalendarDays } from 'lucide-react';

const EgresosView = ({ trimestreMeses }) => {
  // 1. Estado para el mes activo
  const [mesActivo, setMesActivo] = useState(0); 

  // 2. Estado para los datos de egresos (3 arrays vacíos para empezar)
  const [datosEgresos, setDatosEgresos] = useState([
    [{ id: 1, fecha: '', tipo: '', numero: '', concepto: '', importe: 0 }],
    [{ id: 1, fecha: '', tipo: '', numero: '', concepto: '', importe: 0 }],
    [{ id: 1, fecha: '', tipo: '', numero: '', concepto: '', importe: 0 }]
  ]);

  // Efecto para resetear pestaña si el trimestre cambia
  useEffect(() => {
    setMesActivo(0);
  }, [trimestreMeses]);

  // Manejador de cambios en inputs
  const handleInputChange = (mesIndex, filaId, campo, valor) => {
    const nuevosDatos = [...datosEgresos];
    nuevosDatos[mesIndex] = nuevosDatos[mesIndex].map(fila => 
      fila.id === filaId ? { ...fila, [campo]: valor } : fila
    );
    setDatosEgresos(nuevosDatos);
  };

  // Agregar fila de egreso
  const agregarFila = (mesIndex) => {
    const nuevosDatos = [...datosEgresos];
    const nuevaFila = { 
      id: Date.now(), 
      fecha: '', tipo: '', numero: '', concepto: '', importe: 0 
    };
    nuevosDatos[mesIndex] = [...nuevosDatos[mesIndex], nuevaFila];
    setDatosEgresos(nuevosDatos);
  };

  // Calcular total de egresos del mes
  const calcularTotal = (mesIndex) => {
    return datosEgresos[mesIndex].reduce((sum, fila) => sum + parseFloat(fila.importe || 0), 0);
  };

  // Clases comunes para el diseño
  const tdClass = "border border-gray-300 p-1";
  const inputClass = "w-full p-1.5 outline-none bg-transparent text-sm focus:bg-white";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* PESTAÑAS DE MESES (Misma lógica, pero con un borde gris) */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        {trimestreMeses.map((mes, index) => (
          <button
            key={mes}
            onClick={() => setMesActivo(index)}
            className={`px-8 py-4 text-sm font-bold transition-all border-r border-gray-200 flex items-center gap-2 ${
              mesActivo === index 
              ? 'bg-white text-gray-900 border-t-4 border-t-gray-800 shadow-sm' 
              : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <CalendarDays size={16} />
            {mes.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 italic underline uppercase tracking-tight">
            RELACIÓN DE EGRESOS - {trimestreMeses[mesActivo]} 2026
          </h2>
          <button 
            onClick={() => agregarFila(mesActivo)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all shadow-md font-medium"
          >
            <Plus size={18} /> Agregar Fila
          </button>
        </div>

        {/* TABLA DE EGRESOS */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100 text-xs font-bold uppercase text-gray-600">
                <th className="border border-gray-300 p-3 w-12 text-center">N°</th>
                <th className="border border-gray-300 p-3 w-28 text-left">Fecha</th>
                <th className="border border-gray-300 p-3 w-40 text-left">Tipo Comp.</th>
                <th className="border border-gray-300 p-3 w-40 text-left">N° Comp.</th>
                <th className="border border-gray-300 p-3 text-left">Concepto</th>
                <th className="border border-gray-300 p-3 w-40 text-left">Importe (S/.)</th>
              </tr>
            </thead>
            <tbody>
              {datosEgresos[mesActivo].map((fila, index) => (
                <tr key={fila.id} className="hover:bg-red-50/30">
                  <td className="border border-gray-300 p-2 text-center bg-gray-50 font-bold">{index + 1}</td>
                  <td className={tdClass}>
                    <input type="text" value={fila.fecha} onChange={(e) => handleInputChange(mesActivo, fila.id, 'fecha', e.target.value)} className={inputClass} placeholder="05-abr" />
                  </td>
                  <td className={tdClass}>
                    <input type="text" value={fila.tipo} onChange={(e) => handleInputChange(mesActivo, fila.id, 'tipo', e.target.value)} className={inputClass} />
                  </td>
                  <td className={tdClass}>
                    <input type="text" value={fila.numero} onChange={(e) => handleInputChange(mesActivo, fila.id, 'numero', e.target.value)} className={inputClass} />
                  </td>
                  <td className={tdClass}>
                    <input type="text" value={fila.concepto} onChange={(e) => handleInputChange(mesActivo, fila.id, 'concepto', e.target.value)} className={inputClass} />
                  </td>
                  <td className={tdClass}>
                    <input 
                      type="number" 
                      value={fila.importe} 
                      onChange={(e) => handleInputChange(mesActivo, fila.id, 'importe', e.target.value)} 
                      className={`${inputClass} text-right font-mono text-base text-red-700`}
                    />
                  </td>
                </tr>
              ))}
              {/* FILA DE TOTAL DE EGRESOS */}
              <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                <td colSpan="5" className="border border-gray-300 p-3 text-right uppercase tracking-wider text-xs">Total Egresos Mensuales</td>
                <td className="border border-gray-300 p-3 text-right text-red-800 font-mono text-xl bg-red-50">
                  {new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2 }).format(calcularTotal(mesActivo))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all font-bold shadow-lg">
            <Save size={20} /> Guardar Egresos del Mes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EgresosView;