const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const obtenerTieneColumnaDebeCambiarPassword = async (connection) => {
  const [columns] = await connection.execute(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'usuarios'
        AND COLUMN_NAME = 'debe_cambiar_password'
      LIMIT 1
    `
  );

  return columns.length > 0;
};

/**
 * LOGIN
 * Valida contra la tabla usuarios de MySQL usando bcrypt.
 * POST /api/auth/login
 * Body: { correo: "director@colegio.edu.pe", password: "contrasena" }
 */
const login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({
      success: false,
      message: 'Correo y contraseña son requeridos.'
    });
  }

  // Capturar datos del cliente para la auditoría de inicio de sesión
  const ipAddress = req.ip || req.connection?.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || 'Desconocido';

  let connection;

  try {
    connection = await pool.getConnection();
    const tieneColumnaDebeCambiarPassword = await obtenerTieneColumnaDebeCambiarPassword(connection);

    const [usuarios] = await connection.execute(
      `
        SELECT
          id,
          email,
          password_hash,
          rol,
          nombre,
          director_id,
          ${tieneColumnaDebeCambiarPassword ? 'COALESCE(debe_cambiar_password, FALSE)' : 'FALSE'} AS debe_cambiar_password
        FROM usuarios
        WHERE email = ?
      `,
      [correo.trim()]
    );

    if (usuarios.length === 0) {
      await connection.execute(
        `INSERT INTO login_logs (email, exitoso, razon_fallo, ip_address, user_agent) VALUES (?, FALSE, 'Usuario no encontrado', ?, ?)`,
        [correo.trim(), ipAddress, userAgent]
      );
      return res.status(401).json({
        success: false,
        message: 'Correo o contrasena incorrectos.'
      });
    }

    const usuario = usuarios[0];
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      await connection.execute(
        `INSERT INTO login_logs (usuario_id, email, exitoso, razon_fallo, ip_address, user_agent) VALUES (?, ?, FALSE, 'Contraseña incorrecta', ?, ?)`,
        [usuario.id, correo.trim(), ipAddress, userAgent]
      );
      return res.status(401).json({
        success: false,
        message: 'Correo o contraseña incorrectos.'
      });
    }

    let directorData = null;

    if (usuario.director_id) {
      const [directores] = await connection.execute(
        `
          SELECT
            d.id,
            d.dni,
            d.nombres,
            d.apellido_paterno,
            d.apellido_materno,
            d.celular,
            d.email,
            d.institucion_id,
            ie.nombre_ie
          FROM directores d
          JOIN instituciones_educativas ie ON d.institucion_id = ie.id
          WHERE d.id = ?
        `,
        [usuario.director_id]
      );

      if (directores.length > 0) {
        directorData = directores[0];
      }
    }

    // Registrar log exitoso
    await connection.execute(
      `INSERT INTO login_logs (usuario_id, email, exitoso, ip_address, user_agent) VALUES (?, ?, TRUE, ?, ?)`,
      [usuario.id, correo.trim(), ipAddress, userAgent]
    );

    // Actualizar último login
    await connection.execute(
      `UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?`,
      [usuario.id]
    );

    connection.release();
    connection = null;

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'firma_secreta_ugel_2026',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre || (usuario.rol === 'admin' ? 'Administrador' : 'Usuario'),
        rol: usuario.rol,
        debeCambiarPassword: Boolean(usuario.debe_cambiar_password),
        director: directorData
          ? {
              id: directorData.id,
              dni: directorData.dni,
              nombres: directorData.nombres,
              apellido_paterno: directorData.apellido_paterno,
              apellido_materno: directorData.apellido_materno,
              celular: directorData.celular,
              email: directorData.email,
              school: directorData.nombre_ie,
              institucion_id: directorData.institucion_id
            }
          : null
      }
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    if (connection) {
      connection.release();
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * CAMBIO DE CONTRASENA
 * POST /api/auth/change-password
 * Cambio normal: { currentPassword: "actual", newPassword: "nueva" }
 * Primer ingreso: { newPassword: "nueva", isFirstLoginChange: true }
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword, isFirstLoginChange } = req.body;
  const userId = req.usuario?.id;

  if (!userId || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'No se pudo identificar al usuario o falta la nueva contraseña.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La nueva contraseña debe tener al menos 6 caracteres.'
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    const tieneColumnaDebeCambiarPassword = await obtenerTieneColumnaDebeCambiarPassword(connection);

    const [usuarios] = await connection.execute(
      `
        SELECT
          id,
          password_hash,
          ${tieneColumnaDebeCambiarPassword ? 'COALESCE(debe_cambiar_password, FALSE)' : 'FALSE'} AS debe_cambiar_password
        FROM usuarios
        WHERE id = ?
      `,
      [userId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    const usuario = usuarios[0];
    const esCambioPrimerIngreso = Boolean(isFirstLoginChange);

    if (esCambioPrimerIngreso && !usuario.debe_cambiar_password) {
      return res.status(400).json({
        success: false,
        message: 'Este usuario ya no tiene un cambio obligatorio pendiente.'
      });
    }

    if (!esCambioPrimerIngreso) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña actual es requerida.'
        });
      }

      const passwordValida = await bcrypt.compare(currentPassword, usuario.password_hash);

      if (!passwordValida) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta.'
        });
      }
    }

    const mismaPassword = await bcrypt.compare(newPassword, usuario.password_hash);

    if (mismaPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña no puede ser igual a la actual.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const [result] = await connection.execute(
      tieneColumnaDebeCambiarPassword
        ? 'UPDATE usuarios SET password_hash = ?, debe_cambiar_password = FALSE WHERE id = ?'
        : 'UPDATE usuarios SET password_hash = ? WHERE id = ?',
      [hashedPassword, usuario.id]
    );

    connection.release();
    connection = null;

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la contraseña.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente.',
      debeCambiarPassword: false
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    if (connection) {
      connection.release();
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.'
    });
  }
};

module.exports = { login, changePassword };
