const { Router } = require('express');
const configuracionController = require('../controllers/configuracion.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = Router();

// Endpoints globales (deben ir antes de los paramétricos /:clave)
router.get('/', configuracionController.obtenerTodas);

router.use(authMiddleware);
router.post('/upload', upload.single('image'), configuracionController.subirImagen);
router.put('/', configuracionController.guardarMultiples);

// Endpoints paramétricos
router.get('/:clave', configuracionController.obtener);
router.put('/:clave', configuracionController.guardar);

module.exports = router;
