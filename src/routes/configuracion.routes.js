const { Router } = require('express');
const configuracionController = require('../controllers/configuracion.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

// Endpoints globales (deben ir antes de los paramétricos /:clave)
router.get('/', configuracionController.obtenerTodas);

router.use(authMiddleware);
router.put('/', configuracionController.guardarMultiples);

// Endpoints paramétricos
router.get('/:clave', configuracionController.obtener);
router.put('/:clave', configuracionController.guardar);

module.exports = router;
