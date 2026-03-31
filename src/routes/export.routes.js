const { Router } = require('express');
const exportController = require('../controllers/export.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @openapi
 * /api/export/beneficiarios:
 *   get:
 *     summary: Descargar lista consolidada de todos los beneficiarios
 *     description: Retorna un archivo CSV con la información consolidada de Adultos Mayores, Estudiantes, Pasajeros Frecuentes, Carabineros y FACH. Solo activos.
 *     tags: [Exportaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archivo CSV generado exitosamente.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/beneficiarios', authMiddleware, exportController.descargarTodosLosBeneficiarios);

/**
 * @openapi
 * /api/export/convenios:
 *   get:
 *     summary: Descargar lista de todos los convenios (activos e inactivos)
 *     description: Retorna un archivo CSV con toda la información técnica y métricas de consumo de TODOS los convenios.
 *     tags: [Exportaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archivo CSV de todos los convenios generado exitosamente.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/convenios', authMiddleware, exportController.descargarTodosLosConvenios);

/**
 * @openapi
 * /api/export/eventos:
 *   get:
 *     summary: Descargar lista de todos los boletos (eventos)
 *     description: Retorna un archivo CSV con la totalidad de los registros de la tabla eventos (boletos), incluyendo datos de pasajeros, montos y estados.
 *     tags: [Exportaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archivo CSV de boletos generado exitosamente.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/eventos', authMiddleware, exportController.descargarTodosLosEventos);

module.exports = router;
