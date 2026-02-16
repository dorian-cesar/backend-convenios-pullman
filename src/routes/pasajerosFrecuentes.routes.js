const express = require('express');
const router = express.Router();
const pasajerosFrecuentesController = require('../controllers/pasajerosFrecuentes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/pasajeros-frecuentes:
 *   post:
 *     summary: Crear un nuevo pasajero frecuente
 *     tags: [Pasajeros Frecuentes]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasajeroFrecuente'
 *     responses:
 *       201:
 *         description: Pasajero frecuente creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasajeroFrecuente'
 *
 *   get:
 *     summary: Listar todos los pasajeros frecuentes
 *     tags: [Pasajeros Frecuentes]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
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
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre (búsqueda parcial)
 *       - in: query
 *         name: rut
 *         schema:
 *           type: string
 *         description: Filtrar por RUT exacto
 *       - in: query
 *         name: codigo_frecuente
 *         schema:
 *           type: string
 *         description: Filtrar por código de pasajero frecuente
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de pasajeros frecuentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems: { type: integer }
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PasajeroFrecuente'
 *
 * /api/pasajeros-frecuentes/{id}:
 *   get:
 *     summary: Obtener un pasajero frecuente por ID
 *     tags: [Pasajeros Frecuentes]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del pasajero frecuente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasajeroFrecuente'
 *       404:
 *         description: Pasajero frecuente no encontrado
 *
 *   put:
 *     summary: Actualizar un pasajero frecuente por ID
 *     tags: [Pasajeros Frecuentes]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
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
 *             $ref: '#/components/schemas/PasajeroFrecuente'
 *     responses:
 *       200:
 *         description: Pasajero frecuente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasajeroFrecuente'
 *       404:
 *         description: Pasajero frecuente no encontrado
 *
 *   delete:
 *     summary: Eliminar un pasajero frecuente por ID
 *     tags: [Pasajeros Frecuentes]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Pasajero frecuente eliminado
 *       404:
 *         description: Pasajero frecuente no encontrado
 *
 * /api/pasajeros-frecuentes/rut/{rut}:
 *   get:
 *     summary: Obtener un pasajero frecuente por RUT
 *     tags: [Pasajeros Frecuentes]
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del pasajero frecuente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasajeroFrecuente'
 *       404:
 *         description: Pasajero frecuente no encontrado
 *
 * /api/pasajeros-frecuentes/activar/{id}:
 *   patch:
 *     summary: Activar un pasajero frecuente por ID
 *     tags: [Pasajeros Frecuentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pasajero frecuente activado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasajeroFrecuente'
 *       404:
 *         description: Pasajero frecuente no encontrado
 */
router.use(authMiddleware);
router.post('/', pasajerosFrecuentesController.crear);
router.get('/', pasajerosFrecuentesController.listar);
router.get('/:id', pasajerosFrecuentesController.obtener);
router.get('/rut/:rut', pasajerosFrecuentesController.obtenerPorRut);
router.put('/:id', pasajerosFrecuentesController.actualizar);
router.patch('/activar/:id', pasajerosFrecuentesController.activar);
router.delete('/:id', pasajerosFrecuentesController.eliminar);

module.exports = router;
