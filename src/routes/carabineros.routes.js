const { Router } = require('express');
const carabinerosController = require('../controllers/carabineros.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Carabineros
 *   description: Gestión de funcionarios de Carabineros y validación de convenio
 */

/**
 * @openapi
 * /api/carabineros:
 *   get:
 *     summary: Obtener todos los Carabineros (Paginado)
 *     tags: [Carabineros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de carabineros paginada
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
 *                     type: object
 *                     properties:
 *                       rut:
 *                         type: string
 *                       nombre_completo:
 *                         type: string
 *                       status:
 *                         type: string
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       500:
 *         description: Error interno
 */
router.get('/', authMiddleware, carabinerosController.getAll);

/**
 * @openapi
 * /api/carabineros/{rut}:
 *   get:
 *     summary: Obtener un Carabinero por RUT
 *     tags: [Carabineros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *         description: RUT del carabinero
 *     responses:
 *       200:
 *         description: Datos del carabinero
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rut:
 *                   type: string
 *                 nombre_completo:
 *                   type: string
 *                 status:
 *                   type: string
 *       404:
 *         description: Carabinero no encontrado
 *       500:
 *         description: Error interno
 */
router.get('/:rut', authMiddleware, carabinerosController.getOne);

/**
 * @openapi
 * /api/carabineros:
 *   post:
 *     summary: Crear un nuevo Carabinero
 *     tags: [Carabineros]
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
 *             properties:
 *               rut:
 *                 type: string
 *               nombre_completo:
 *                 type: string
 *               status:
 *                 type: string
 *                 default: ACTIVO
 *     responses:
 *       201:
 *         description: Carabinero creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El Carabinero ya existe
 *       500:
 *         description: Error interno
 */
router.post('/', authMiddleware, carabinerosController.create);

/**
 * @openapi
 * /api/carabineros/{rut}:
 *   put:
 *     summary: Actualizar un Carabinero
 *     tags: [Carabineros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *         description: RUT del carabinero
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Carabinero actualizado
 *       404:
 *         description: Carabinero no encontrado
 *       500:
 *         description: Error interno
 */
router.put('/:rut', authMiddleware, carabinerosController.update);

/**
 * @openapi
 * /api/carabineros/{rut}:
 *   delete:
 *     summary: Eliminar un Carabinero
 *     tags: [Carabineros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *         description: RUT del carabinero
 *     responses:
 *       200:
 *         description: Carabinero eliminado
 *       404:
 *         description: Carabinero no encontrado
 *       500:
 *         description: Error interno
 */
router.delete('/:rut', authMiddleware, carabinerosController.delete);

/**
 * @openapi
 * /api/carabineros/validar:
 *   post:
 *     summary: Validar RUT de Carabinero
 *     description: Valida si el RUT pertenece a la tabla de Carabineros (buscando por cuerpo del RUT). Si es válido, crea/actualiza el pasajero y lo asocia al convenio.
 *     tags: [Carabineros]
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
 *                 example: "12345678-9"
 *     responses:
 *       200:
 *         description: Validación exitosa. Retorna el pasajero y los descuentos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 afiliado:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Validación exitosa"
 *                 pasajero:
 *                   $ref: '#/components/schemas/Pasajero'
 *                 empresa:
 *                   type: string
 *                   example: "CARABINEROS DE CHILE"
 *                 descuentos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       convenio:
 *                         type: string
 *                         example: "CARABINEROS"
 *                       porcentaje:
 *                         type: integer
 *                         example: 15
 *       400:
 *         description: RUT inválido o faltante.
 *       403:
 *         description: Funcionario inactivo.
 *       404:
 *         description: RUT no encontrado en registros.
 *       500:
 *         description: Error interno o de configuración.
 */
router.post('/validar', carabinerosController.validar);

module.exports = router;
