const { Router } = require('express');
const pasajerosController = require('../controllers/pasajeros.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Pasajeros
 *   description: Gestión de pasajeros
 */

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @openapi
 * /api/pasajeros:
 *   get:
 *     summary: Listar pasajeros
 *     tags:
 *       - Pasajeros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *         description: Filtrar por empresa
 *       - in: query
 *         name: convenio_id
 *         schema:
 *           type: integer
 *         description: Filtrar por convenio
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
 *         description: Lista de pasajeros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pasajero'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *   post:
 *     summary: Crear un nuevo pasajero
 *     tags:
 *       - Pasajeros
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rut
 *               - nombres
 *               - apellidos
 *               - fecha_nacimiento
 *             properties:
 *               rut:
 *                 type: string
 *                 example: "12345678-9"
 *               nombres:
 *                 type: string
 *                 example: Juan
 *               apellidos:
 *                 type: string
 *                 example: Pérez
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               correo:
 *                 type: string
 *                 example: juan.perez@email.com
 *               telefono:
 *                 type: string
 *                 example: "+56912345678"
 *               tipo_pasajero_id:
 *                 type: integer
 *                 example: 1
 *                 description: Opcional, se calcula automáticamente por edad si no se proporciona
 *               empresa_id:
 *                 type: integer
 *                 example: 1
 *               convenio_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pasajero creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pasajero'
 */
router.post('/', pasajerosController.crear);

// Swagger definitions moved to a consolidated block
router.get('/', pasajerosController.listar);

/**
 * @openapi
 * /api/pasajeros/{id}:
 *   get:
 *     summary: Obtener pasajero por ID
 *     tags:
 *       - Pasajeros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pasajero
 *     responses:
 *       200:
 *         description: Pasajero encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pasajero'
 *       404:
 *         description: Pasajero no encontrado
 */
router.get('/:id', pasajerosController.obtener);

/**
 * @openapi
 * /api/pasajeros/rut/{rut}:
 *   get:
 *     summary: Buscar pasajero por RUT
 *     tags:
 *       - Pasajeros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *         description: RUT del pasajero
 *         example: "12345678-9"
 *     responses:
 *       200:
 *         description: Pasajero encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pasajero'
 *       404:
 *         description: Pasajero no encontrado
 */
router.get('/rut/:rut', pasajerosController.buscarPorRut);

/**
 * @openapi
 * /api/pasajeros/{id}:
 *   put:
 *     summary: Actualizar pasajero
 *     tags:
 *       - Pasajeros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pasajero
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *                 example: Juan Carlos
 *               apellidos:
 *                 type: string
 *                 example: Pérez González
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               correo:
 *                 type: string
 *                 example: juan.perez@email.com
 *               telefono:
 *                 type: string
 *                 example: "+56912345678"
 *               tipo_pasajero_id:
 *                 type: integer
 *                 example: 1
 *               empresa_id:
 *                 type: integer
 *                 example: 1
 *               convenio_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *                 example: ACTIVO
 *     responses:
 *       200:
 *         description: Pasajero actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pasajero'
 */
router.put('/:id', pasajerosController.actualizar);

/**
 * @openapi
 * /api/pasajeros/{id}:
 *   delete:
 *     summary: Eliminar pasajero (soft delete)
 *     tags:
 *       - Pasajeros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pasajero
 *     responses:
 *       204:
 *         description: Pasajero eliminado exitosamente
 */
router.delete('/:id', pasajerosController.eliminar);

module.exports = router;
