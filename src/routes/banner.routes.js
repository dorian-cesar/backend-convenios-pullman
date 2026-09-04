const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const upload = require('../middlewares/upload.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/hero', bannerController.obtenerHeroBanners);

// Rutas protegidas (Mantenedor)
router.get('/', authMiddleware, bannerController.listar);
router.post('/', authMiddleware, upload.single('image'), bannerController.crear);
router.put('/:id', authMiddleware, bannerController.actualizar);
router.delete('/:id', authMiddleware, bannerController.eliminar);

module.exports = router;
