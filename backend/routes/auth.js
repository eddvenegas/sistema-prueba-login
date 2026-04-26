const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { registrarAccionFrontend } = require('../controllers/auditController');


// POST /api/auth/login
router.post('/login', login);

router.post('/auditoria/frontend', verificarToken, registrarAccionFrontend); 

// POST /api/auth/change-password
router.post('/change-password', verificarToken, changePassword);

module.exports = router;
