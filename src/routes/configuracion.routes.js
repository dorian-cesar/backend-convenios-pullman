const { Router } = require('express');
const configuracionController = require('../controllers/configuracion.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

// Endpoint público para obtener la configuración (ej. límite de destacados)
router.get('/:clave', configuracionController.obtener);

// Endpoints protegidos para guardar configuración
router.use(authMiddleware);
router.put('/:clave', configuracionController.guardar);

module.exports = router;
