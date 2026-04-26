const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificacionesController');

// GET: Obtener todas las notificaciones de un director
router.get('/:directorId', notificacionesController.getNotificaciones);

// PUT: Marcar todas las notificaciones de un director como leídas
router.put('/:directorId/leidas', notificacionesController.marcarComoLeidas);

module.exports = router;