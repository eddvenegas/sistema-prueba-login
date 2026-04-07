const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/change-password
router.post('/change-password', changePassword);

module.exports = router;
