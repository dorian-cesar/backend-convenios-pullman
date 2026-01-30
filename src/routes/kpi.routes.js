const { Router } = require('express');
const controller = require('../controllers/kpi.controller');
const auth = require('../middlewares/auth.middleware');
const roles = require('../middlewares/roles.middleware');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: KPIs
 *   description: Indicadores Clave de Desempeño (Solo SUPER_USUARIO)
 */

// Middleware de seguridad general para KPIs
router.use(auth);
router.use(roles(['SUPER_USUARIO', 'USUARIO']));

/**
 * @openapi
 * /api/kpis/resumen:
 *   get:
 *     summary: Obtener resumen de KPIs
 *     description: Devuelve métricas agrupadas por tiempo. SUPER_USUARIO ve todo o filtra por empresa. USUARIO ve solo su empresa.
 *     tags: [KPIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: granularidad
 *         schema:
 *           type: string
 *           enum: [diario, semanal, mensual, trimestral, semestral, anual, quinquenal]
 *           default: mensual
 *         description: Nivel de agrupación temporal
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *         description: Filtrar por empresa (Solo SUPER_USUARIO)
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Datos de KPIs
 */
router.get('/resumen', controller.getResumen);

// ... (Alias routes kept for compatibility)
router.get('/ventas', controller.getVentas);
router.get('/devoluciones', controller.getDevoluciones);
router.get('/descuentos', controller.getDescuentos);
router.get('/pasajeros', controller.getPasajeros);

/**
 * @openapi
 * /api/kpis/por-convenio:
 *   get:
 *     summary: KPIs por Convenio
 *     description: Cantidad de pasajes y monto total por convenio.
 *     tags: [KPIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de convenios con métricas
 */
router.get('/por-convenio', controller.getPorConvenio);

/**
 * @openapi
 * /api/kpis/por-codigo:
 *   get:
 *     summary: KPIs por Código de Descuento
 *     description: Cantidad de pasajes y monto total por código usado.
 *     tags: [KPIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de códigos con métricas
 */
router.get('/por-codigo', controller.getPorCodigo);

/**
 * @openapi
 * /api/kpis/por-tipo-pasajero:
 *   get:
 *     summary: KPIs por Tipo de Pasajero
 *     description: Cantidad de pasajes y monto total por tipo de pasajero (Adulto, Niño, etc).
 *     tags: [KPIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de tipos de pasajero con métricas
 */
router.get('/por-tipo-pasajero', controller.getPorTipoPasajero);

module.exports = router;
