const express = require('express');
const router = express.Router();
const colocoloController = require('../controllers/colocolo.controller');

/**
 * @swagger
 * /api/integraciones/colocolo/validar:
 *   post:
 *     tags:
 *       - Integraciones - Colo Colo
 *     summary: Validar afiliación en CSD Colo Colo
 *     description: Consulta a la API externa de Colo Colo para verificar si una persona es socio activo con cuotas al día.
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
 *                 example: '136626906'
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *       400:
 *         description: Petición inválida
 *       500:
 *         description: Error del servidor o de la integración
 */
router.post('/colocolo/validar', colocoloController.validar);

module.exports = router;
