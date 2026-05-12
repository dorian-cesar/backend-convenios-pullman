const express = require('express');
const reembolsoController = require('../controllers/reembolso.controller');
const auth = require('../middlewares/auth.middleware');
const roles = require('../middlewares/roles.middleware');

const router = express.Router();

/**
 * Todas las rutas de reembolsos requieren autenticación
 * y solo están disponibles para SISTEMA y SUPER_USUARIO
 */

// Rutas administrativas (protegidas)
router.get('/', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.listar);
router.post('/', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.crear);
router.put('/:id', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.actualizar);

// Rutas públicas (por token dinámico)
router.get('/public/:token', reembolsoController.obtenerPorToken);
router.put('/public/:token', reembolsoController.actualizarPorToken);

module.exports = router;
