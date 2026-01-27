const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

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
 *         description: Token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post('/login', authController.login);


/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar usuario (público)
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
 *                 example: usuario@pullman.cl
 *               password:
 *                 type: string
 *                 example: User1234
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post('/register', authController.register);

module.exports = router;
