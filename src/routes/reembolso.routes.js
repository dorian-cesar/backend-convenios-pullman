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
router.post('/', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.crear);
router.get('/', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.listar);
router.put('/:id', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.actualizar);
router.post('/:id/sync-monday', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.sincronizarMonday);
router.post('/sync-status', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.sincronizarEstados);
router.post('/reiniciar/:id', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.reiniciarSolicitud);
router.post('/:id/send-email', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.enviarEmailLink);
router.delete('/:id', auth, roles(['SUPER_USUARIO', 'SISTEMA']), reembolsoController.eliminar);

// Rutas públicas (por token dinámico)
router.get('/ping', (req, res) => res.send('pong'));
router.get('/public/:token', reembolsoController.obtenerPorToken);
router.put('/public/:token', reembolsoController.actualizarPorToken);

module.exports = router;
