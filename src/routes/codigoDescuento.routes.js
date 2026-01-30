const { Router } = require('express');
const codigoDescuentoController = require('../controllers/codigoDescuento.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Códigos de Descuento
 *   description: Gestión de códigos de descuento
 */

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @openapi
 * /api/codigos-descuento:
 *   get:
 *     summary: Listar códigos de descuento
 *     tags:
 *       - Códigos de Descuento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: convenio_id
 *         schema:
 *           type: integer
 *         description: Filtrar por convenio
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: vigentes
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrar solo códigos vigentes (activos y dentro del rango de fechas)
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
 *         description: Lista de códigos de descuento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CodigoDescuento'
 *   post:
 *     summary: Crear código de descuento (solo SUPER_USUARIO)
 *     tags:
 *       - Códigos de Descuento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - convenio_id
 *               - codigo
 *               - fecha_inicio
 *               - fecha_termino
 *             properties:
 *               convenio_id:
 *                 type: integer
 *                 example: 1
 *               codigo:
 *                 type: string
 *                 example: VERANO2026
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-01"
 *               fecha_termino:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-31"
 *               max_usos:
 *                 type: integer
 *                 example: 100
 *                 description: Opcional, null = ilimitado
 *     responses:
 *       201:
 *         description: Código de descuento creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CodigoDescuento'
 */
router.post('/', rolesMiddleware(['SUPER_USUARIO']), codigoDescuentoController.crear);
router.get('/', codigoDescuentoController.listar);

/**
 * @openapi
 * /api/codigos-descuento/{id}:
 *   get:
 *     summary: Obtener código de descuento por ID
 *     tags:
 *       - Códigos de Descuento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de descuento
 *     responses:
 *       200:
 *         description: Código de descuento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CodigoDescuento'
 *       404:
 *         description: Código de descuento no encontrado
 */
router.get('/:id', codigoDescuentoController.obtener);

/**
 * @openapi
 * /api/codigos-descuento/codigo/{codigo}:
 *   get:
 *     summary: Buscar código de descuento por código
 *     tags:
 *       - Códigos de Descuento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código del descuento
 *         example: VERANO2026
 *     responses:
 *       200:
 *         description: Código de descuento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CodigoDescuento'
 *       404:
 *         description: Código de descuento no encontrado
 */
router.get('/codigo/:codigo', codigoDescuentoController.buscarPorCodigo);

/**
 * @openapi
 * /api/codigos-descuento/validar:
 *   post:
 *     summary: Validar y usar código de descuento
 *     description: Valida el código y si es válido, incrementa el contador de usos
 *     tags:
 *       - Códigos de Descuento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: VERANO2026
 *     responses:
 *       200:
 *         description: Código válido y uso registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CodigoDescuento'
 *       400:
 *         description: Código inválido, expirado o sin usos disponibles
 */
router.post('/validar', codigoDescuentoController.validarYUsar);

/**
 * @openapi
 * /api/codigos-descuento/{id}:
 *   put:
 *     summary: Actualizar código de descuento (solo SUPER_USUARIO)
 *     tags:
 *       - Códigos de Descuento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de descuento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-01"
 *               fecha_termino:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-30"
 *               max_usos:
 *                 type: integer
 *                 example: 200
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *                 example: ACTIVO
 *     responses:
 *       200:
 *         description: Código de descuento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CodigoDescuento'
 */
router.put('/:id', rolesMiddleware(['SUPER_USUARIO']), codigoDescuentoController.actualizar);

/**
 * @openapi
 * /api/codigos-descuento/{id}:
 *   delete:
 *     summary: Eliminar código de descuento (soft delete, solo SUPER_USUARIO)
 *     tags:
 *       - Códigos de Descuento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código de descuento
 *     responses:
 *       204:
 *         description: Código de descuento eliminado exitosamente
 */
router.delete('/:id', rolesMiddleware(['SUPER_USUARIO']), codigoDescuentoController.eliminar);

module.exports = router;
