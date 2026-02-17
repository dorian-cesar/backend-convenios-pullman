const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles de usuario
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Listar roles
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de roles
 */
router.get('/', authMiddleware, rolesController.getAll);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener rol por ID
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del rol
 *       404:
 *         description: Rol no encontrado
 */
router.get('/:id', authMiddleware, rolesController.getOne);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: ADMINISTRADOR
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *                 default: ACTIVO
 *     responses:
 *       201:
 *         description: Rol creado
 */
router.post('/', authMiddleware, rolesController.create);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualizar un rol
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: Rol actualizado
 */
router.put('/:id', authMiddleware, rolesController.update);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Desactivar un rol (Soft Delete lógico)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rol desactivado
 */
router.delete('/:id', authMiddleware, rolesController.delete);

module.exports = router;
