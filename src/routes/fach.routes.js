const express = require('express');
const router = express.Router();
const fachController = require('../controllers/fach.controller');
const fachValidation = require('../validations/fach.validation');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: FACH
 *   description: API para la gestión de registros FACH
 */

/**
 * @swagger
 * /api/fach:
 *   post:
 *     summary: Crea un nuevo registro FACH
 *     tags: [FACH]
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
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
 *               empresa_id:
 *                 type: integer
 *               convenio_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       201:
 *         description: Registro creado
 */
router.post(
    '/',
    authMiddleware,
    validate({ body: fachValidation.crear }),
    fachController.crear
);

/**
 * @swagger
 * /api/fach:
 *   get:
 *     summary: Lista todos los registros FACH (Paginado)
 *     tags: [FACH]
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
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
 *         name: rut
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de registros
 */
router.get(
    '/',
    authMiddleware,
    validate({ query: fachValidation.listar }),
    fachController.listarTodos
);

/**
 * @swagger
 * /api/fach/{rut}:
 *   get:
 *     summary: Obtiene un registro FACH por su RUT
 *     tags: [FACH]
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro encontrado
 */
router.get(
    '/:rut',
    authMiddleware,
    fachController.obtenerPorRut
);

/**
 * @swagger
 * /api/fach/{rut}:
 *   put:
 *     summary: Actualiza un registro FACH existente
 *     tags: [FACH]
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               empresa_id:
 *                 type: integer
 *               convenio_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: Registro actualizado
 */
router.put(
    '/:rut',
    authMiddleware,
    validate({ body: fachValidation.actualizar }),
    fachController.actualizar
);

/**
 * @swagger
 * /api/fach/{rut}:
 *   delete:
 *     summary: Elimina lógicamente un registro FACH
 *     tags: [FACH]
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro eliminado correctamente
 */
router.delete(
    '/:rut',
    authMiddleware,
    fachController.eliminar
);

/**
 * @swagger
 * /api/fach/{rut}/estado:
 *   patch:
 *     summary: Alterna el estado (ACTIVO/INACTIVO) de un registro FACH
 *     tags: [FACH]
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado alternado
 */
router.patch(
    '/:rut/estado',
    authMiddleware,
    fachController.cambiarEstado
);

/**
 * @swagger
 * /api/fach/validar:
 *   post:
 *     summary: Validar RUT de funcionario FACH
 *     description: Endpoint para cajas. Valida si el RUT pertenece a FACH. Si es válido y activo, retorna o crea el pasajero.
 *     tags: [FACH]
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
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Validación exitosa.
 *       400:
 *         description: RUT inválido o faltante.
 *       403:
 *         description: Funcionario inactivo.
 *       404:
 *         description: RUT no encontrado.
 */
router.post(
    '/validar',
    authMiddleware,
    validate({ body: fachValidation.validar }),
    fachController.validar
);

/**
 * @swagger
 * /api/fach/validar-rut:
 *   post:
 *     summary: Validar RUT de funcionario FACH (Estándar)
 *     description: Endpoint estandarizado para validación. Valida si el RUT pertenece a FACH. Si es válido y activo, retorna o crea el pasajero.
 *     tags: [FACH]
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
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Validación exitosa.
 *       400:
 *         description: RUT inválido o faltante.
 *       403:
 *         description: Funcionario inactivo.
 *       404:
 *         description: RUT no encontrado.
 */
router.post(
    '/validar-rut',
    authMiddleware,
    validate({ body: fachValidation.validar }),
    fachController.validar
);

module.exports = router;
