const { Router } = require('express');
const beneficiarioController = require('../controllers/beneficiario.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const beneficiarioValidation = require('../validations/beneficiario.validation');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Beneficiarios
 *   description: Gestión unificada de personas beneficiarias y sus programas correspondientes
 */

router.use(authMiddleware);

/**
 * @openapi
 * /api/beneficiarios:
 *   post:
 *     summary: Crear un nuevo registro de beneficiario
 *     tags: [Beneficiarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearBeneficiario'
 *     responses:
 *       201:
 *         description: Beneficiario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficiario'
 */
router.post('/', validate(beneficiarioValidation.crearBeneficiario), beneficiarioController.crear);
/**
 * @openapi
 * /api/beneficiarios:
 *   get:
 *     summary: Listar todos los beneficiarios registrados
 *     tags: [Beneficiarios]
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
router.get('/', beneficiarioController.listar);
/**
 * @openapi
 * /api/beneficiarios/{id}:
 *   get:
 *     summary: Obtener beneficiario por ID
 *     tags: [Beneficiarios]
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
 *               $ref: '#/components/schemas/Beneficiario'
 */
router.get('/:id', validate(beneficiarioValidation.getBeneficiario), beneficiarioController.obtener);
/**
 * @openapi
 * /api/beneficiarios/rut/{rut}:
 *   get:
 *     summary: Obtener beneficiario filtrando por RUT
 *     tags: [Beneficiarios]
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
 *               $ref: '#/components/schemas/Beneficiario'
 */
router.get('/rut/:rut', validate(beneficiarioValidation.getPorRut), beneficiarioController.obtenerPorRut);
/**
 * @openapi
 * /api/beneficiarios/{id}:
 *   put:
 *     summary: Actualizar beneficiario
 *     tags: [Beneficiarios]
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
 *             $ref: '#/components/schemas/ActualizarBeneficiario'
 *     responses:
 *       200:
 *         description: Beneficiario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficiario'
 */
router.put('/:id', validate(beneficiarioValidation.actualizarBeneficiario), beneficiarioController.actualizar);
/**
 * @openapi
 * /api/beneficiarios/{id}:
 *   delete:
 *     summary: Eliminar beneficiario
 *     tags: [Beneficiarios]
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
router.delete('/:id', validate(beneficiarioValidation.getBeneficiario), beneficiarioController.eliminar);
/**
 * @openapi
 * /api/beneficiarios/{id}/activar:
 *   patch:
 *     summary: Activar beneficiario
 *     tags: [Beneficiarios]
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
router.patch('/:id/activar', beneficiarioController.activar);

module.exports = router;
