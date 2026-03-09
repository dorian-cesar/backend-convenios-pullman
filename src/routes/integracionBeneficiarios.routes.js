const { Router } = require('express');
const integracionBeneficiariosController = {
    validarEstudiante: require('../controllers/integracionBeneficiarios.controller').validarEstudiante,
    validarAdultoMayor: require('../controllers/integracionBeneficiarios.controller').validarAdultoMayor,
    validarPasajeroFrecuente: require('../controllers/integracionBeneficiarios.controller').validarPasajeroFrecuente,
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
 * /api/integraciones/beneficiarios/estudiante/validar:
 *   post:
 *     summary: Validar RUT de Estudiante y retornar Convenio
 *     description: Verifica si el RUT pertenece a un estudiante activo y vincula el convenioId solicitado. Retorna el convenio completo con sus rutas.
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
 *                 example: "20.200.200-K"
 *               convenioId:
 *                 type: integer
 *                 example: 159
 *     responses:
 *       200:
 *         description: Estudiante válido. Retorna datos del pasajero y el convenio solicitado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidacionBeneficiarioResponse'
 *       400:
 *         description: Error de validación (RUT o convenioId faltante)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Estudiante o Convenio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Estudiante inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/estudiante/validar', validate(validarBeneficiario), integracionBeneficiariosController.validarEstudiante);

/**
 * @openapi
 * /api/integraciones/beneficiarios/adulto-mayor/validar:
 *   post:
 *     summary: Validar RUT de Adulto Mayor y retornar Convenio
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
 *                 example: "5.500.500-5"
 *               convenioId:
 *                 type: integer
 *                 example: 160
 *     responses:
 *       200:
 *         description: Adulto Mayor válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidacionBeneficiarioResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Adulto Mayor o Convenio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/adulto-mayor/validar', validate(validarBeneficiario), integracionBeneficiariosController.validarAdultoMayor);

/**
 * @openapi
 * /api/integraciones/beneficiarios/pasajero-frecuente/validar:
 *   post:
 *     summary: Validar RUT de Pasajero Frecuente y retornar Convenio
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
 *                 example: "10.100.100-1"
 *               convenioId:
 *                 type: integer
 *                 example: 161
 *     responses:
 *       200:
 *         description: Pasajero Frecuente válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidacionBeneficiarioResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pasajero Frecuente o Convenio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/pasajero-frecuente/validar', validate(validarBeneficiario), integracionBeneficiariosController.validarPasajeroFrecuente);

/**
 * @openapi
 * /api/integraciones/beneficiarios/validar:
 *   post:
 *     summary: Validación Unificada de Beneficiarios (Nuevo Estándar)
 *     description: Valida un RUT contra la tabla de beneficios unificada. Permite filtrar opcionalmente por tipo_beneficio.
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
 *               tipo_beneficio:
 *                 type: string
 *                 enum: [ESTUDIANTE, ADULTO_MAYOR, PASAJERO_FRECUENTE, CARABINERO, FACH]
 *                 description: Opcional. Si no se envía buscador en todos los tipos.
 *     responses:
 *       200:
 *         description: Beneficiario válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidacionBeneficiarioResponse'
 *       404:
 *         description: Beneficiario no encontrado
 *       403:
 *         description: Beneficio inactivo
 */
router.post('/validar', validate(validarBeneficiario), integracionBeneficiariosController.validar);

module.exports = router;
