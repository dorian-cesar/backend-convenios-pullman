const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracion.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, configuracionController.obtenerParametros);
router.put('/', authMiddleware, configuracionController.actualizarParametros);

module.exports = router;
