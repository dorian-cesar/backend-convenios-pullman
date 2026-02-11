const express = require('express');
const controller = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const apiKeyController = require('../controllers/apiKey.controller');
const roles = require('../middlewares/roles.middleware');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Admin
 *   description: Administración de usuarios y roles
 */

/**
 * @openapi
 * /api/admin/usuarios:
 *   post:
 *     summary: Crear usuario (solo SUPER_USUARIO) — crea `USUARIO` por defecto
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 example: nuevo@pullman.cl
 *               password:
 *                 type: string
 *                 example: Pass1234
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               rut:
 *                 type: string
 *                 example: 12345678-9
 *               telefono:
 *                 type: string
 *                 example: +56912345678
 *               rol:
 *                 type: string
 *                 enum: [USUARIO, SUPER_USUARIO]
 *                 example: USUARIO
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 correo:
 *                   type: string
 *                 rol:
 *                   type: string
 *                 message:
 *                   type: string
 *                   example: Usuario creado satisfactoriamente
 */
router.post(
  '/usuarios',
  auth,
  roles(['SUPER_USUARIO']),
  controller.crearUsuario
);

/**
 * @openapi
 * /api/admin/usuarios:
 *   get:
 *     summary: Listar usuarios
 *     security:
 *       - bearerAuth: []
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: correo
 *         schema:
 *           type: string
 *         description: Filtrar por coincidencia de correo
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get(
  '/usuarios',
  auth,
  roles(['SUPER_USUARIO']),
  controller.listarUsuarios
);

/**
 * @openapi
 * /api/admin/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por id
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  '/usuarios/:id',
  auth,
  roles(['SUPER_USUARIO']),
  controller.obtenerUsuario
);

/**
 * @openapi
 * /api/admin/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
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
 *               correo:
 *                 type: string
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [USUARIO, SUPER_USUARIO]
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 */
router.put(
  '/usuarios/:id',
  auth,
  roles(['SUPER_USUARIO']),
  controller.actualizarUsuario
);

/**
 * @openapi
 * /api/admin/usuarios/{id}:
 *   delete:
 *     summary: Eliminar (soft) usuario
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Usuario marcado como INACTIVO
 */
router.delete(
  '/usuarios/:id',
  auth,
  roles(['SUPER_USUARIO']),
  controller.eliminarUsuario
);

/**
 * @openapi
 * tags:
 *   name: ApiKeys
 *   description: Gestión de llaves API para servicios externos
 */

/**
 * @openapi
 * /api/admin/api-keys:
 *   post:
 *     summary: Crear nueva API Key
 *     security:
 *       - bearerAuth: []
 *     tags: [ApiKeys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Servicio Externo X" }
 *     responses:
 *       201:
 *         description: API Key creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKey'
 */
router.post('/api-keys', auth, roles(['SUPER_USUARIO']), apiKeyController.crearApiKey);

/**
 * @openapi
 * /api/admin/api-keys:
 *   get:
 *     summary: Listar API Keys
 *     security:
 *       - bearerAuth: []
 *     tags: [ApiKeys]
 *     responses:
 *       200:
 *         description: Lista de API Keys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ApiKey'
 */
router.get('/api-keys', auth, roles(['SUPER_USUARIO']), apiKeyController.listarApiKeys);

/**
 * @openapi
 * /api/admin/api-keys/{id}:
 *   get:
 *     summary: Obtener API Key por id
 *     security:
 *       - bearerAuth: []
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Datos de la API Key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKey'
 */
router.get('/api-keys/:id', auth, roles(['SUPER_USUARIO']), apiKeyController.obtenerApiKey);

/**
 * @openapi
 * /api/admin/api-keys/{id}:
 *   put:
 *     summary: Actualizar API Key
 *     security:
 *       - bearerAuth: []
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               status: { type: string, enum: [ACTIVO, INACTIVO] }
 *     responses:
 *       200:
 *         description: API Key actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKey'
 */
router.put('/api-keys/:id', auth, roles(['SUPER_USUARIO']), apiKeyController.actualizarApiKey);

/**
 * @openapi
 * /api/admin/api-keys/{id}:
 *   delete:
 *     summary: Eliminar API Key
 *     security:
 *       - bearerAuth: []
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: API Key eliminada
 */
router.delete('/api-keys/:id', auth, roles(['SUPER_USUARIO']), apiKeyController.eliminarApiKey);


module.exports = router;
