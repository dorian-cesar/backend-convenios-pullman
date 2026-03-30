const { Router } = require('express');
const exportController = require('../controllers/export.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @openapi
 * /api/export/beneficiarios:
 *   get:
 *     summary: Descargar lista consolidada de todos los beneficiarios
 *     description: Retorna un archivo CSV con la información consolidada de Adultos Mayores, Estudiantes, Pasajeros Frecuentes, Carabineros y FACH.
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
 *               example: "Empresa;Convenio;RUT\nPullman;Convenio 1;12345678-9\n..."
 */
router.get('/beneficiarios', authMiddleware, exportController.descargarTodosLosBeneficiarios);

module.exports = router;
