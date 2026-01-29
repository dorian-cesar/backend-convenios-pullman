const { Router } = require('express');
const controller = require('../controllers/empresa.controller');
const auth = require('../middlewares/auth.middleware');
const roles = require('../middlewares/roles.middleware');

const router = Router();

/**
 * @openapi
 * /api/empresas:
 *   get:
 *     summary: Listar todas las empresas
 *     tags:
 *       - Empresas
 *     responses:
 *       200:
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   rut_empresa:
 *                     type: string
 *                   status:
 *                     type: string
 */
router.get('/', auth, controller.listar);

/**
 * @openapi
 * /api/empresas/{id}:
 *   get:
 *     summary: Obtener empresa por id
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Empresas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empresa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       404:
 *         description: Empresa no encontrada
 */
router.get('/:id', auth, controller.obtener);

/**
 * CRUD → solo SUPER_USUARIO (rol_id = 1)
 */
/**
 * @openapi
 * /api/empresas:
 *   post:
 *     summary: Crear empresa (solo SUPER_USUARIO)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Empresas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - rut
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Empresa Corporativa S.A.
 *               rut:
 *                 type: string
 *                 example: 76.000.123-4
 *     responses:
 *       201:
 *         description: Empresa creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 rut_empresa:
 *                   type: string
 *                 status:
 *                   type: string
 */
router.post('/', auth, roles(['SUPER_USUARIO']), controller.crear);

/**
 * @openapi
 * /api/empresas/{id}:
 *   put:
 *     summary: Actualizar empresa (solo SUPER_USUARIO)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Empresas
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
 *               rut:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: Empresa actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 rut_empresa:
 *                   type: string
 *                 status:
 *                   type: string
 */
router.put('/:id', auth, roles(['SUPER_USUARIO']), controller.actualizar);

/**
 * @openapi
 * /api/empresas/{id}:
 *   delete:
 *     summary: Eliminar (soft) empresa (solo SUPER_USUARIO)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Empresas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Empresa marcada como INACTIVA
 */
router.delete('/:id', auth, roles(['SUPER_USUARIO']), controller.eliminar);

module.exports = router;
