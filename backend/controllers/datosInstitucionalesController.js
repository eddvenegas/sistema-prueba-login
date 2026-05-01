const db = require('../config/db'); // Asumiendo que esta es tu conexión a BD

// @desc    Obtener los datos institucionales de un director
// @route   GET /api/datos-institucionales/:directorId
const getDatos = async (req, res) => {
  try {
    const { directorId } = req.params;
    
    // Usamos el pool de mysql2 para ejecutar la consulta
    const [rows] = await db.pool.execute(
      'SELECT * FROM datos_institucionales WHERE director_id = ?', 
      [directorId]
    );
    
    if (rows.length === 0) {
      return res.json({ success: true, data: null }); // Aún no ha guardado datos
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error obteniendo datos institucionales:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

// @desc    Crear o actualizar los datos institucionales
// @route   POST /api/datos-institucionales/:directorId
const saveDatos = async (req, res) => {
  try {
    const { directorId } = req.params;
    const { nombre_tesorero, dni_tesorero, celular_tesorero, numero_cuenta_corriente, banco } = req.body;

    // --- Validación en el Backend ---
    // Validamos que si se envía un DNI, este tenga 8 dígitos numéricos.
    if (dni_tesorero && (dni_tesorero.length !== 8 || !/^\d{8}$/.test(dni_tesorero))) {
      return res.status(400).json({ success: false, message: 'El DNI del tesorero debe contener exactamente 8 dígitos numéricos.' });
    }
    // Validamos que si se envía un celular, este tenga 9 dígitos numéricos.
    if (celular_tesorero && (celular_tesorero.length !== 9 || !/^\d{9}$/.test(celular_tesorero))) {
      return res.status(400).json({ success: false, message: 'El celular del tesorero debe contener exactamente 9 dígitos numéricos.' });
    }

    // Verificar si el director ya tiene datos registrados
    const [existing] = await db.pool.execute('SELECT id FROM datos_institucionales WHERE director_id = ?', [directorId]);

    if (existing.length > 0) {
      // Si ya existen, los ACTUALIZAMOS (UPDATE)
      await db.pool.execute(`
        UPDATE datos_institucionales 
        SET nombre_tesorero = ?, dni_tesorero = ?, celular_tesorero = ?, numero_cuenta_corriente = ?, banco = ?
        WHERE director_id = ?
      `, [nombre_tesorero, dni_tesorero, celular_tesorero, numero_cuenta_corriente, banco || 'Banco de la Nación', directorId]);
    } else {
      // Si no existen, los CREAMOS (INSERT)
      await db.pool.execute(`
        INSERT INTO datos_institucionales (director_id, nombre_tesorero, dni_tesorero, celular_tesorero, numero_cuenta_corriente, banco)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [directorId, nombre_tesorero, dni_tesorero, celular_tesorero, numero_cuenta_corriente, banco || 'Banco de la Nación']);
    }

    res.json({ success: true, message: 'Datos institucionales guardados correctamente.' });
  } catch (error) {
    console.error('Error guardando datos institucionales:', error);
    res.status(500).json({ success: false, message: 'Error al guardar los datos en el servidor.' });
  }
};

module.exports = { getDatos, saveDatos };