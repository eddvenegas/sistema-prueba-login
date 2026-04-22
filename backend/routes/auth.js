const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/change-password
router.post('/change-password', verificarToken, changePassword);

module.exports = router;
