const express = require('express');
const router = express.Router();
const { getDatos, saveDatos } = require('../controllers/datosInstitucionalesController');

// Ruta para obtener los datos de un director
router.get('/:directorId', getDatos);

// Ruta para guardar o actualizar los datos de un director
router.post('/:directorId', saveDatos);

module.exports = router;