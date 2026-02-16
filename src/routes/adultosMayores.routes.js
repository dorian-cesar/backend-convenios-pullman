const express = require('express');
const router = express.Router();
const adultosMayoresController = require('../controllers/adultosMayores.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/adultos-mayores:
 *   post:
 *     summary: Crear un nuevo adulto mayor
 *     tags: [Adultos Mayores]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdultoMayor'
 *     responses:
 *       201:
 *         description: Adulto mayor creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdultoMayor'
 *
 *   get:
 *     summary: Listar todos los adultos mayores
 *     tags: [Adultos Mayores]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de adultos mayores
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
 *                     $ref: '#/components/schemas/AdultoMayor'
 *
 * /api/adultos-mayores/{id}:
 *   get:
 *     summary: Obtener un adulto mayor por ID
 *     tags: [Adultos Mayores]
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
 *         description: Datos del adulto mayor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdultoMayor'
 *       404:
 *         description: Adulto mayor no encontrado
 *
 *   put:
 *     summary: Actualizar un adulto mayor por ID
 *     tags: [Adultos Mayores]
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
 *             $ref: '#/components/schemas/AdultoMayor'
 *     responses:
 *       200:
 *         description: Adulto mayor actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdultoMayor'
 *       404:
 *         description: Adulto mayor no encontrado
 *
 *   delete:
 *     summary: Eliminar un adulto mayor por ID
 *     tags: [Adultos Mayores]
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
 *         description: Adulto mayor eliminado
 *       404:
 *         description: Adulto mayor no encontrado
 *
 * /api/adultos-mayores/rut/{rut}:
 *   get:
 *     summary: Obtener un adulto mayor por RUT
 *     tags: [Adultos Mayores]
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del adulto mayor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdultoMayor'
 *       404:
 *         description: Adulto mayor no encontrado
 *
 * /api/adultos-mayores/activar/{id}:
 *   patch:
 *     summary: Activar un adulto mayor por ID
 *     tags: [Adultos Mayores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Adulto mayor activado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdultoMayor'
 *       404:
 *         description: Adulto mayor no encontrado
 */
router.use(authMiddleware);
router.post('/', adultosMayoresController.crear);
router.get('/', adultosMayoresController.listar);
router.get('/:id', adultosMayoresController.obtener);
router.get('/rut/:rut', adultosMayoresController.obtenerPorRut);
router.put('/:id', adultosMayoresController.actualizar);
router.patch('/activar/:id', adultosMayoresController.activar);
router.delete('/:id', adultosMayoresController.eliminar);

module.exports = router;
