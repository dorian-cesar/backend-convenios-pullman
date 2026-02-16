const { Router } = require('express');
const carabinerosController = require('../controllers/carabineros.controller');
// const authMiddleware = require('../middlewares/auth.middleware'); // Descomentar si requiere auth

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Carabineros
 *   description: Validación de convenio Carabineros
 */

/**
 * @openapi
 * /api/carabineros/validar:
 *   post:
 *     summary: Validar RUT de Carabinero
 *     description: Valida si el RUT pertenece a la tabla de Carabineros (buscando por cuerpo del RUT). Si es válido, crea/actualiza el pasajero y lo asocia al convenio.
 *     tags: [Carabineros]
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
 *         description: Validación exitosa. Retorna el pasajero y los descuentos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 afiliado:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Validación exitosa"
 *                 pasajero:
 *                   $ref: '#/components/schemas/Pasajero'
 *                 empresa:
 *                   type: string
 *                   example: "CARABINEROS DE CHILE"
 *                 descuentos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       convenio:
 *                         type: string
 *                         example: "CARABINEROS"
 *                       porcentaje:
 *                         type: integer
 *                         example: 15
 *       400:
 *         description: RUT inválido o faltante.
 *       403:
 *         description: Funcionario inactivo.
 *       404:
 *         description: RUT no encontrado en registros.
 *       500:
 *         description: Error interno o de configuración.
 */
router.post('/validar', carabinerosController.validar);

module.exports = router;
