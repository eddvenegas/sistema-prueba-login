const express = require('express');
const router = express.Router();
const { crearSolicitud, obtenerSolicitudes, procesarSolicitud } = require('../controllers/solicitudesController');

// Rutas para las solicitudes de reemplazo
router.get('/', obtenerSolicitudes);
router.post('/', crearSolicitud);
router.put('/:id', procesarSolicitud);

module.exports = router;