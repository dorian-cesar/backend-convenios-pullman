const { Router } = require('express');
const descuentoController = require('../controllers/descuento.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Descuentos
 *   description: Gestión de reglas de descuento
 */

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @openapi
 * /api/descuentos:
 *   get:
 *     summary: Listar descuentos
 *     tags:
 *       - Descuentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: convenio_id
 *         schema:
 *           type: integer
 *         description: Filtrar por convenio
 *       - in: query
 *         name: codigo_descuento_id
 *         schema:
 *           type: integer
 *         description: Filtrar por código de descuento
 *       - in: query
 *         name: tipo_pasajero_id
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de pasajero
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
 *         description: Lista de descuentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Descuento'
 *   post:
 *     summary: Crear descuento (solo SUPER_USUARIO)
 *     description: Crea una regla de descuento para Convenio + TipoPasajero o CodigoDescuento
 *     tags:
 *       - Descuentos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - porcentaje_descuento
 *             properties:
 *               convenio_id:
 *                 type: integer
 *                 example: 1
 *                 description: Requerido si no se proporciona codigo_descuento_id
 *               codigo_descuento_id:
 *                 type: integer
 *                 example: 1
 *                 description: Requerido si no se proporciona convenio_id
 *               tipo_pasajero_id:
 *                 type: integer
 *                 example: 1
 *                 description: Opcional, null = aplica a todos los tipos
 *               pasajero_id:
 *                 type: integer
 *                 example: 1
 *                 description: Opcional, para descuentos personalizados
 *               porcentaje_descuento:
 *                 type: integer
 *                 example: 15
 *                 description: Porcentaje entre 0 y 100
 *     responses:
 *       201:
 *         description: Descuento creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Descuento'
 */
router.post('/', rolesMiddleware(['SUPER_USUARIO']), descuentoController.crear);
router.get('/', descuentoController.listar);

/**
 * @openapi
 * /api/descuentos/{id}:
 *   get:
 *     summary: Obtener descuento por ID
 *     tags:
 *       - Descuentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del descuento
 *     responses:
 *       200:
 *         description: Descuento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Descuento'
 *       404:
 *         description: Descuento no encontrado
 */
router.get('/:id', descuentoController.obtener);

/**
 * @openapi
 * /api/descuentos/{id}:
 *   put:
 *     summary: Actualizar descuento (solo SUPER_USUARIO)
 *     tags:
 *       - Descuentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del descuento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               porcentaje_descuento:
 *                 type: integer
 *                 example: 20
 *                 description: Porcentaje entre 0 y 100
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *                 example: ACTIVO
 *     responses:
 *       200:
 *         description: Descuento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Descuento'
 */
router.put('/:id', rolesMiddleware(['SUPER_USUARIO']), descuentoController.actualizar);

/**
 * @openapi
 * /api/descuentos/{id}:
 *   delete:
 *     summary: Eliminar descuento (soft delete, solo SUPER_USUARIO)
 *     tags:
 *       - Descuentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del descuento
 *     responses:
 *       204:
 *         description: Descuento eliminado exitosamente
 */
router.delete('/:id', rolesMiddleware(['SUPER_USUARIO']), descuentoController.eliminar);

module.exports = router;
