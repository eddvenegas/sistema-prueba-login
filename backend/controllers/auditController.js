const { logAuditoria } = require('../utils/auditLogger');

const registrarAccionFrontend = async (req, res) => {
    try {
        const { modulo, accion, descripcion } = req.body;
        
        // Obtener el ID del usuario desde el token JWT (puede estar en req.usuario o req.user)
        const usuario_id = req.usuario?.id || req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        await logAuditoria({
            usuario_id, modulo, accion, descripcion,
            ip_address: req.ip
        });

        res.status(200).json({ success: true, message: 'Auditoría registrada' });
    } catch (error) {
        console.error('Error al registrar auditoría desde frontend:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

module.exports = { registrarAccionFrontend };