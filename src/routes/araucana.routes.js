const { Router } = require('express');
const controller = require('../controllers/araucana.controller');
const auth = require('../middlewares/auth.middleware');

const router = Router();

// Endpoint público (sin auth)
// router.use(auth);

/**
 * @openapi
 * /api/integraciones/araucana/validar:
 *   post:
 *     summary: Validar afiliación La Araucana
 *     description: Consulta API externa. Si es afiliado (1001), asocia al pasajero y retorna descuentos.
 *     tags:
 *       - Integraciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rut
 *             properties:
 *               rut:
 *                 type: string
 *                 example: "12345678-9"
 *     responses:
 *       200:
 *         description: Consulta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 afiliado:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 pasajero:
 *                   type: object
 *                 empresa:
 *                   type: string
 *                 descuentos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       convenio:
 *                         type: string
 *                       porcentaje:
 *                         type: integer
 */
router.post('/araucana/validar', controller.validar);

module.exports = router;
