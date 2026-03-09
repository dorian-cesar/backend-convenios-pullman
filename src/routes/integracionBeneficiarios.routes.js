const { Router } = require('express');
const integracionBeneficiariosController = {
    validar: require('../controllers/integracionBeneficiarios.controller').validar
};
const validate = require('../middlewares/validate.middleware');
const { validarBeneficiario } = require('../validations/integracionBeneficiarios.validation');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Integraciones Beneficiarios
 *   description: Endpoints que simulan APIs externas de validación contra tablas internas del sistema
 */

/**
 * @openapi
 * /api/integraciones/beneficiarios/validar:
 *   post:
 *     summary: Validación Unificada de Beneficiarios
 *     description: Valida un RUT contra la tabla de beneficios unificada usando el ID del convenio asociado.
 *     tags:
 *       - Integraciones Beneficiarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rut
 *               - convenioId
 *             properties:
 *               rut:
 *                 type: string
 *                 example: "11.111.111-1"
 *               convenioId:
 *                 type: integer
 *                 example: 158
 *                 description: ID del convenio sobre el cual se consulta el beneficio.
 *     responses:
 *       200:
 *         description: Beneficiario válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidacionBeneficiarioResponse'
 *       404:
 *         description: Beneficio no encontrado para el RUT ingresado en este convenio.
 *       403:
 *         description: Beneficio inactivo
 */
router.post('/validar', validate(validarBeneficiario), integracionBeneficiariosController.validar);

module.exports = router;
