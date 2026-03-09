const { Router } = require('express');
const beneficioController = require('../controllers/beneficio.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const beneficioValidation = require('../validations/beneficio.validation');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Beneficios
 *   description: Gestión unificada de personas beneficiarias y sus programas correspondientes
 */

router.use(authMiddleware);

/**
 * @openapi
 * /api/beneficios:
 *   post:
 *     summary: Crear un nuevo registro de beneficiario
 *     tags: [Beneficios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearBeneficio'
 *     responses:
 *       201:
 *         description: Beneficiario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficio'
 */
router.post('/', validate(beneficioValidation.crearBeneficio), beneficioController.crear);
/**
 * @openapi
 * /api/beneficios:
 *   get:
 *     summary: Listar todos los beneficiarios registrados
 *     tags: [Beneficios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: convenio_id
 *         schema:
 *           type: integer
 *         description: Filtrar por convenio asociado
 *     responses:
 *       200:
 *         description: Lista de beneficiarios
 */
router.get('/', beneficioController.listar);
/**
 * @openapi
 * /api/beneficios/{id}:
 *   get:
 *     summary: Obtener beneficiario por ID
 *     tags: [Beneficios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del beneficiario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficio'
 */
router.get('/:id', validate(beneficioValidation.getBeneficio), beneficioController.obtener);
/**
 * @openapi
 * /api/beneficios/rut/{rut}:
 *   get:
 *     summary: Obtener beneficiario filtrando por RUT
 *     tags: [Beneficios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: convenio_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del beneficiario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficio'
 */
router.get('/rut/:rut', validate(beneficioValidation.getPorRut), beneficioController.obtenerPorRut);
/**
 * @openapi
 * /api/beneficios/{id}:
 *   put:
 *     summary: Actualizar beneficiario
 *     tags: [Beneficios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarBeneficio'
 *     responses:
 *       200:
 *         description: Beneficiario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficio'
 */
router.put('/:id', validate(beneficioValidation.actualizarBeneficio), beneficioController.actualizar);
/**
 * @openapi
 * /api/beneficios/{id}:
 *   delete:
 *     summary: Eliminar beneficiario
 *     tags: [Beneficios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Beneficiario eliminado
 */
router.delete('/:id', validate(beneficioValidation.getBeneficio), beneficioController.eliminar);
/**
 * @openapi
 * /api/beneficios/{id}/activar:
 *   patch:
 *     summary: Activar beneficiario
 *     tags: [Beneficios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Beneficiario activado
 */
router.patch('/:id/activar', beneficioController.activar);

module.exports = router;
