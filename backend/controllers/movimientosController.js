const { pool } = require('../config/db');

const TABLAS_PERMITIDAS = {
  ingresos: 'ingresos',
  egresos: 'egresos',
};

const obtenerTabla = (tipo) => TABLAS_PERMITIDAS[tipo];

const normalizarTexto = (valor) => String(valor || '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const MAPA_TIPOS_COMPROBANTE = {
  factura: 'Factura',
  boleta: 'Boleta',
  'recibo por honorarios': 'Recibo por Honorarios',
  'declaracion jurada': 'Declaración Jurada',
};

const normalizarTipoComprobante = (tipo) => (
  MAPA_TIPOS_COMPROBANTE[normalizarTexto(tipo)] || ''
);

const registroTieneContenido = (registro) => (
  Boolean(registro?.fecha)
  || Boolean(String(registro?.numero_comprobante || '').trim())
  || Boolean(String(registro?.concepto || '').trim())
  || Number(registro?.monto || 0) > 0
  || Boolean(String(registro?.tipo_comprobante || '').trim())
);

const validarRegistro = (registro) => (
  registro
  && registro.fecha
  && normalizarTipoComprobante(registro.tipo_comprobante)
  && registro.numero_comprobante?.trim()
  && registro.concepto?.trim()
  && registro.monto !== ''
  && registro.monto !== null
  && registro.monto !== undefined
);

const listarMovimientos = async (req, res) => {
  const { tipo } = req.params;
  const { directorId, startDate, endDate } = req.query;
  const tabla = obtenerTabla(tipo);

  if (!tabla) {
    return res.status(400).json({ success: false, message: 'Tipo de movimiento no válido.' });
  }

  if (!directorId || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'directorId, startDate y endDate son requeridos.',
    });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, director_id, fecha, tipo_comprobante, numero_comprobante, concepto, monto
       FROM ${tabla}
       WHERE director_id = ? AND fecha BETWEEN ? AND ?
       ORDER BY fecha ASC, id ASC`,
      [directorId, startDate, endDate]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error listando ${tabla}:`, error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

const guardarMovimientos = async (req, res) => {
  const { tipo } = req.params;
  const { directorId, startDate, endDate, registros } = req.body;
  const tabla = obtenerTabla(tipo);

  if (!tabla) {
    return res.status(400).json({ success: false, message: 'Tipo de movimiento no válido.' });
  }

  if (!directorId || !startDate || !endDate || !Array.isArray(registros)) {
    return res.status(400).json({
      success: false,
      message: 'directorId, startDate, endDate y registros son requeridos.',
    });
  }

  const filasTipoInvalido = registros
    .map((registro, index) => ({ registro, index }))
    .filter(({ registro }) => registroTieneContenido(registro) && !normalizarTipoComprobante(registro.tipo_comprobante))
    .map(({ index }) => index + 1);

  if (filasTipoInvalido.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Tipo de comprobante inválido en la(s) fila(s): ${filasTipoInvalido.join(', ')}.`,
    });
  }

  const registrosValidos = registros
    .filter(validarRegistro)
    .map((registro) => ({
      fecha: registro.fecha,
      tipo_comprobante: normalizarTipoComprobante(registro.tipo_comprobante),
      numero_comprobante: registro.numero_comprobante.trim(),
      concepto: registro.concepto.trim(),
      monto: Number(registro.monto),
    }));

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `DELETE FROM ${tabla}
       WHERE director_id = ? AND fecha BETWEEN ? AND ?`,
      [directorId, startDate, endDate]
    );

    if (registrosValidos.length > 0) {
      const values = registrosValidos.map((registro) => [
        directorId,
        registro.fecha,
        registro.tipo_comprobante,
        registro.numero_comprobante,
        registro.concepto,
        registro.monto,
      ]);

      await connection.query(
        `INSERT INTO ${tabla}
         (director_id, fecha, tipo_comprobante, numero_comprobante, concepto, monto)
         VALUES ?`,
        [values]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `${tabla} guardados correctamente.`,
      totalGuardados: registrosValidos.length,
    });
  } catch (error) {
    await connection.rollback();
    console.error(`Error guardando ${tabla}:`, error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  } finally {
    connection.release();
  }
};

module.exports = {
  listarMovimientos,
  guardarMovimientos,
};
