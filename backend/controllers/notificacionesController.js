const { pool } = require('../config/db');

const getNotificaciones = async (req, res) => {
  try {
    const { directorId } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM notificaciones WHERE director_id = ? ORDER BY fecha_creacion DESC',
      [directorId]
    );
    res.status(200).json({ success: true, notificaciones: rows });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const marcarComoLeidas = async (req, res) => {
  try {
    const { directorId } = req.params;
    await pool.execute(
      'UPDATE notificaciones SET leida = TRUE WHERE director_id = ? AND leida = FALSE',
      [directorId]
    );
    res.status(200).json({ success: true, message: 'Notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al actualizar notificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { getNotificaciones, marcarComoLeidas };