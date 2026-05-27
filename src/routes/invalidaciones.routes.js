const express = require('express');
const invalidacionesController = require('../controllers/invalidaciones.controller');
const auth = require('../middlewares/auth.middleware');
const roles = require('../middlewares/roles.middleware');

const router = express.Router();

// Todas las rutas de logs de invalidación requieren autenticación
router.get('/', auth, roles(['SUPER_USUARIO', 'SISTEMA']), invalidacionesController.listar);
router.get('/:id', auth, roles(['SUPER_USUARIO', 'SISTEMA']), invalidacionesController.obtener);

module.exports = router;
