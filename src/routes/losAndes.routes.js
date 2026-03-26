const { Router } = require('express');
const losAndesController = require('../controllers/losAndes.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/integraciones/los-andes/validar:
 *   post:
 *     summary: Validar afiliación en Caja Los Andes
 *     tags: [Integraciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rut:
 *                 type: string
 *                 example: "12345678-9"
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *       400:
 *         description: Error en la petición
 */
router.post('/los-andes/validar', losAndesController.validar);

module.exports = router;
