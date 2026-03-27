const { Router } = require('express');
const exportController = require('../controllers/export.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Export
 *   description: Endpoints dedicados para exportación masiva de datos (JSON)
 */

/**
 * @openapi
 * /api/export/convenios:
 *   get:
 *     summary: Exportar todos los Convenios (Full Dump)
 *     description: Retorna todos los convenios incluyendo rutas y configuraciones, pero excluyendo imágenes.
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo JSON con todos los convenios (excluye imágenes)
 */
router.get('/convenios', authMiddleware, exportController.exportConvenios);

/**
 * @openapi
 * /api/export/beneficiarios:
 *   get:
 *     summary: Exportar todos los Beneficiarios (Full Dump)
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo JSON con todos los beneficiarios (excluye imágenes)
 */
router.get('/beneficiarios', authMiddleware, exportController.exportBeneficiarios);

/**
 * @openapi
 * /api/export/boletos:
 *   get:
 *     summary: Exportar todos los Boletos/Eventos (Full Dump)
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo JSON con todos los eventos/boletos
 */
router.get('/boletos', authMiddleware, exportController.exportBoletos);

/**
 * @openapi
 * /api/export/pasajeros:
 *   get:
 *     summary: Exportar todos los Pasajeros (Full Dump)
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arreglo JSON con todos los pasajeros
 */
router.get('/pasajeros', authMiddleware, exportController.exportPasajeros);

module.exports = router;
