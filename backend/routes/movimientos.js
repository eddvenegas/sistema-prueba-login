const express = require('express');
const {
  listarMovimientos,
  guardarMovimientos,
} = require('../controllers/movimientosController');

const router = express.Router();

router.get('/:tipo', listarMovimientos);
router.post('/:tipo/replace-range', guardarMovimientos);

module.exports = router;
