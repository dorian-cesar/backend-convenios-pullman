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
const { crearPasajeroFrecuente, actualizarPasajeroFrecuente, getPasajeroFrecuente, getPorRut } = require('../validations/pasajeroFrecuente.validation');
const validate = require('../middlewares/validate.middleware');

router.use(authMiddleware);
router.post('/', validate(crearPasajeroFrecuente), pasajerosFrecuentesController.crear);
router.get('/', pasajerosFrecuentesController.listar);
router.get('/:id', validate(getPasajeroFrecuente), pasajerosFrecuentesController.obtener);
router.get('/rut/:rut', validate(getPorRut), pasajerosFrecuentesController.obtenerPorRut);
router.put('/:id', validate(actualizarPasajeroFrecuente), pasajerosFrecuentesController.actualizar);
router.patch('/activar/:id', validate(getPasajeroFrecuente), pasajerosFrecuentesController.activar);
router.delete('/:id', validate(getPasajeroFrecuente), pasajerosFrecuentesController.eliminar);

/**
 * @swagger
 * /api/pasajeros-frecuentes/validar-rut:
 *   post:
 *     summary: Validar estado de Pasajero Frecuente por RUT
 *     tags: [Pasajeros Frecuentes]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rut
 *             properties:
 *               rut:
 *                 type: string
 *                 example: "10.100.100-1"
 *     responses:
 *       200:
 *         description: Pasajero Frecuente activo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 nombre: { type: string }
 *                 rut: { type: string }
 *                 telefono: { type: string }
 *                 correo: { type: string }
 *                 direccion: { type: string }
 *                 status: { type: string }
 *       404:
 *         description: Pasajero Frecuente no encontrado
 *       409:
 *         description: Pasajero Frecuente INACTIVO
 */
router.post('/validar-rut', pasajerosFrecuentesController.validarRut);

module.exports = router;
