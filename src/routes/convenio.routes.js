const { Router } = require('express');
const convenioController = require('../controllers/convenio.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Convenios
 *   description: Gestión de convenios empresariales
 */

// Endpoint público para listar convenios
router.get('/', convenioController.listar);

// Rutas protegidas
router.use(authMiddleware);

/**
 * @openapi
 * /api/convenios:
 *   get:
 *     description: Retorna lista de convenios con detalles de configuración.
 *     tags:
 *       - Convenios
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *         description: Filtrar por empresa
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Orden de la clasificación
 *     responses:
 *       200:
 *         description: Lista de convenios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Convenio'
 *   post:
 *     summary: Crear un nuevo convenio
 *     tags:
 *       - Convenios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - empresa_id
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Convenio Verano 2026
 *               empresa_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Convenio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 */
router.post('/', convenioController.crear);

// Consolidated block above
router.get('/', convenioController.listar);

/**
 * @openapi
 * /api/convenios/{id}:
 *   get:
 *     summary: Obtener convenio por ID
 *     tags:
 *       - Convenios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del convenio
 *     responses:
 *       200:
 *         description: Convenio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 *       404:
 *         description: Convenio no encontrado
 */
router.get('/:id', convenioController.obtener);

/**
 * @openapi
 * /api/convenios/{id}:
 *   put:
 *     summary: Actualizar convenio
 *     tags:
 *       - Convenios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del convenio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Convenio Invierno 2026
 *               empresa_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *                 example: ACTIVO
 *     responses:
 *       200:
 *         description: Convenio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 */
router.put('/:id', convenioController.actualizar);

/**
 * @openapi
 * /api/convenios/{id}:
 *   delete:
 *     summary: Eliminar convenio (soft delete)
 *     tags:
 *       - Convenios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del convenio
 *     responses:
 *       204:
 *         description: Convenio eliminado exitosamente
 */
router.delete('/:id', convenioController.eliminar);

module.exports = router;
