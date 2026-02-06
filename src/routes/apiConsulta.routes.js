const { Router } = require('express');
const apiConsultaController = require('../controllers/apiConsulta.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { crearApiConsulta, actualizarApiConsulta, obtenerApiConsulta } = require('../validations/apiConsulta.validation');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: APIs Consulta
 *   description: Gestión de configuraciones de endpoints externos e internos
 */

router.use(authMiddleware);

/**
 * @openapi
 * /api/apis-consulta:
 *   post:
 *     summary: Crear una nueva API de consulta
 *     tags: [APIs Consulta]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, endpoint]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "API Araucana"
 *               endpoint:
 *                 type: string
 *                 example: "/api/integraciones/araucana/validar"
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *                 default: ACTIVO
 *     responses:
 *       201:
 *         description: API creada
 *   get:
 *     summary: Listar APIs de consulta
 *     tags: [APIs Consulta]
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
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de APIs
 */
router.post('/', validate(crearApiConsulta), apiConsultaController.crear);
router.get('/', apiConsultaController.listar);

/**
 * @openapi
 * /api/apis-consulta/{id}:
 *   get:
 *     summary: Obtener API por ID
 *     tags: [APIs Consulta]
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
 *       404:
 *         description: No encontrada
 *   put:
 *     summary: Actualizar API
 *     tags: [APIs Consulta]
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
 *     summary: Eliminar API
 *     tags: [APIs Consulta]
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
 *         description: API eliminada
 */
router.get('/:id', validate(obtenerApiConsulta), apiConsultaController.obtener);
router.put('/:id', validate(actualizarApiConsulta), apiConsultaController.actualizar);
router.delete('/:id', validate(obtenerApiConsulta), apiConsultaController.eliminar);

module.exports = router;
