const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Operaciones de autenticación (login, register)
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login de usuario
 *     tags:
 *       - Auth
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
 *                 example: admin@pullman.cl
 *               password:
 *                 type: string
 *                 example: Admin1234
 *     responses:
 *       200:
 *         description: Login exitoso, retorna el token JWT y datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post('/login', authController.login);


/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar usuario (crea un SUPER_USUARIO por defecto)
 *     tags:
 *       - Auth
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
 *                 example: admin@pullman.cl
 *               password:
 *                 type: string
 *                 example: Admin1234
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               rut:
 *                 type: string
 *                 example: 12345678-9
 *               telefono:
 *                 type: string
 *                 example: +56912345678
 *     responses:
 *       201:
 *         description: Registro exitoso, retorna el token JWT y datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post('/register', authController.register);

module.exports = router;
