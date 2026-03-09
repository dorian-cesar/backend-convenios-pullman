const { Router } = require('express');
const apiRegistroController = require('../controllers/apiRegistro.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { crearApiRegistro, actualizarApiRegistro, obtenerApiRegistro } = require('../validations/apiRegistro.validation');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: APIs Registro
 *   description: Gestión de endpoints para registro de beneficiarios
 */

router.use(authMiddleware);

/**
 * @openapi
 * /api/apis-registro:
 *   post:
 *     summary: Crear una nueva API de registro
 *     tags: [APIs Registro]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, endpoint, empresa_id]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "API Registro Estudiante"
 *               endpoint:
 *                 type: string
 *                 example: "/api/integraciones/beneficiarios/estudiante/validar"
 *               empresa_id:
 *                 type: integer
 *                 example: 6
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *                 default: ACTIVO
 *     responses:
 *       201:
 *         description: API creada
 *   get:
 *     summary: Listar APIs de registro
 *     tags: [APIs Registro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de APIs
 */
router.post('/', validate(crearApiRegistro), apiRegistroController.crear);
router.get('/', apiRegistroController.listar);

/**
 * @openapi
 * /api/apis-registro/{id}:
 *   get:
 *     summary: Obtener API de registro por ID
 *     tags: [APIs Registro]
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
 *         description: Detalle de la API
 *   put:
 *     summary: Actualizar API de registro
 *     tags: [APIs Registro]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               endpoint:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: API actualizada
 *   delete:
 *     summary: Eliminar API de registro
 *     tags: [APIs Registro]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: API eliminada
 */
router.get('/:id', validate(obtenerApiRegistro), apiRegistroController.obtener);
router.put('/:id', validate(actualizarApiRegistro), apiRegistroController.actualizar);
router.delete('/:id', validate(obtenerApiRegistro), apiRegistroController.eliminar);

module.exports = router;
