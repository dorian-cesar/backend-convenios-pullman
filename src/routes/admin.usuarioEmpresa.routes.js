const { Router } = require('express');
const controller = require('../controllers/usuarioEmpresa.controller');
const auth = require('../middlewares/auth.middleware');
const roles = require('../middlewares/roles.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: UsuarioEmpresa
 *   description: Asignación de usuarios a empresas (Admin)
 */

/**
 * @swagger
 * /api/admin/usuarios-empresas:
 *   post:
 *     summary: Asignar un usuario a una empresa
 *     description: |
 *       Asigna un usuario existente a una empresa.
 *       Solo puede ser ejecutado por un SUPER_USUARIO.
 *       La asignación queda auditada con el usuario creador.
 *     tags: [UsuarioEmpresa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario_id
 *               - empresa_id
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 example: 5
 *               empresa_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Usuario asignado correctamente a la empresa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 usuario_id:
 *                   type: integer
 *                   example: 5
 *                 empresa_id:
 *                   type: integer
 *                   example: 2
 *                 creado_por:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Usuario asignado a la empresa correctamente
 *       400:
 *         description: Error de negocio (datos inválidos o relación existente)
 *       401:
 *         description: Token inválido o no enviado
 *       403:
 *         description: Acceso denegado (rol insuficiente)
 */
router.post(
  '/usuarios-empresas',
  auth,
  roles(['SUPER_USUARIO']),
  controller.asignarUsuarioEmpresa
);

module.exports = router;
