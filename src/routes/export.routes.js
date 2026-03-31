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
 *               example: "RUT;Email;Convenio;Empresa\n12345678-9;test@test.com;Convenio 1;Empresa A\n..."
 */
router.get('/beneficiarios', authMiddleware, exportController.descargarTodosLosBeneficiarios);

/**
 * @openapi
 * /api/export/convenios:
 *   get:
 *     summary: Descargar lista de todos los convenios activos
 *     description: Retorna un archivo CSV con toda la información técnica y métricas de consumo de los convenios en estado ACTIVO.
 *     tags: [Exportaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archivo CSV de convenios generado exitosamente.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/convenios', authMiddleware, exportController.descargarConveniosActivos);

module.exports = router;
