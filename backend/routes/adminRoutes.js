const express = require('express');
const router = express.Router();
const { downloadBackup, getAuditoriaLogs, getLoginLogs, getUsers, createUser, updateUser, deleteUser } = require('../controllers/adminController');


// Ruta GET: /api/admin/backup
// Genera y descarga un archivo .sql con la base de datos completa
router.get('/backup', downloadBackup);

router.get('/login-logs', getLoginLogs); // Nueva ruta para logs de inicio de sesión

// Agrega la ruta GET
router.get('/auditoria', getAuditoriaLogs); // Protégela con tu middleware JWT

router.get('/usuarios', getUsers); // Nueva ruta para obtener usuarios
router.post('/usuarios', createUser); // Nueva ruta para crear un usuario
router.put('/usuarios/:id', updateUser); // Nueva ruta para actualizar un usuario
router.delete('/usuarios/:id', deleteUser); // Nueva ruta para eliminar un usuario

module.exports = router;