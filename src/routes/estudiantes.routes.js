const express = require('express');
const router = express.Router();
const estudiantesController = require('../controllers/estudiantes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/estudiantes:
 *   post:
 *     summary: Crear un nuevo estudiante
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Estudiante'
 *     responses:
 *       201:
 *         description: Estudiante creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *
 *   get:
 *     summary: Listar todos los estudiantes
 *     tags: [Estudiantes]
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
 *         description: Lista de estudiantes
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
 *                     $ref: '#/components/schemas/Estudiante'
 *
 * /api/estudiantes/{id}:
 *   get:
 *     summary: Obtener un estudiante por ID
 *     tags: [Estudiantes]
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
 *         description: Datos del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *       404:
 *         description: Estudiante no encontrado
 *
 *   put:
 *     summary: Actualizar un estudiante por ID
 *     tags: [Estudiantes]
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
 *             $ref: '#/components/schemas/Estudiante'
 *     responses:
 *       200:
 *         description: Estudiante actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *       404:
 *         description: Estudiante no encontrado
 *
 *   delete:
 *     summary: Eliminar un estudiante por ID
 *     tags: [Estudiantes]
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
 *         description: Estudiante eliminado
 *       404:
 *         description: Estudiante no encontrado
 *
 * /api/estudiantes/rut/{rut}:
 *   get:
 *     summary: Obtener un estudiante por RUT
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *       404:
 *         description: Estudiante no encontrado
 *
 * /api/estudiantes/activar/{id}:
 *   patch:
 *     summary: Activar un estudiante por ID
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estudiante activado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *       404:
 *         description: Estudiante no encontrado
 */
router.use(authMiddleware);
router.post('/', estudiantesController.crear);
router.get('/', estudiantesController.listar);
router.get('/:id', estudiantesController.obtener);
router.get('/rut/:rut', estudiantesController.obtenerPorRut);
router.put('/:id', estudiantesController.actualizar);
router.patch('/activar/:id', estudiantesController.activar);
router.delete('/:id', estudiantesController.eliminar);

/**
 * @swagger
 * /api/estudiantes/validar-rut:
 *   post:
 *     summary: Validar estado de Estudiante por RUT
 *     tags: [Estudiantes]
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
 *         description: Estudiante activo
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
 *                 carnet_estudiante: { type: string }
 *                 fecha_vencimiento: { type: string }
 *                 status: { type: string }
 *       404:
 *         description: Estudiante no encontrado
 *       409:
 *         description: Estudiante INACTIVO
 */
router.post('/validar-rut', estudiantesController.validarRut);

module.exports = router;
