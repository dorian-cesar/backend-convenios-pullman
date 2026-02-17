const { Router } = require('express');
const eventosController = require('../controllers/eventos.controller');
const authMiddleware = require('../middlewares/eventoAuth.middleware');
const validate = require('../middlewares/validate.middleware');
const eventoValidation = require('../validations/evento.validation');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Eventos
 *   description: Gestión de eventos inmutables (COMPRA, CAMBIO, DEVOLUCION)
 */

router.use(authMiddleware);

/**
 * @openapi
 * /api/eventos/compra:
 *   post:
 *     summary: Crear evento de compra
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pasajero_id
 *               - empresa_id
 *               - ciudad_origen
 *               - ciudad_destino
 *               - fecha_viaje
 *               - hora_salida
 *               - tarifa_base
 *             properties:
 *               pasajero_id:
 *                 type: integer
 *                 example: 1
 *               empresa_id:
 *                 type: integer
 *                 example: 1
 *               convenio_id:
 *                 type: integer
 *                 example: 1
 *                 nullable: true
 *               ciudad_origen:
 *                 type: string
 *                 example: "Santiago"
 *               ciudad_destino:
 *                 type: string
 *                 example: "Valparaíso"
 *               fecha_viaje:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-15"
 *               hora_salida:
 *                 type: string
 *                 example: "14:30"
 *                 description: "Formato HH:mm"
 *               terminal_origen:
 *                 type: string
 *                 example: "Terminal Sur"
 *               terminal_destino:
 *                 type: string
 *                 example: "Terminal Valparaíso"
 *               numero_asiento:
 *                 type: string
 *                 example: "A12"
 *               numero_ticket:
 *                 type: string
 *                 example: "T-12345"
 *               pnr:
 *                 type: string
 *                 example: "PNR-XYZ"
 *               tarifa_base:
 *                 type: integer
 *                 example: 50000
 *               codigo_autorizacion:
 *                 type: string
 *                 example: "123456"
 *               token:
 *                 type: string
 *                 example: "token_transbank_abc123"
 *               estado:
 *                 type: string
 *                 enum: [confirmado, anulado, revertido]
 *                 example: "confirmado"
 *     responses:
 *       201:
 *         description: Evento de compra creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Entidad relacionada no encontrada
 */
router.post('/compra', validate(eventoValidation.crearCompra), eventosController.crearCompra);

/**
 * @openapi
 * /api/eventos/cambio:
 *   post:
 *     summary: Crear evento de cambio
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evento_origen_id
 *               - ciudad_origen
 *               - ciudad_destino
 *               - fecha_viaje
 *               - hora_salida
 *               - tarifa_base
 *             properties:
 *               evento_origen_id:
 *                 type: integer
 *                 example: 100
 *                 description: "ID del último evento válido de la cadena"
 *               ciudad_origen:
 *                 type: string
 *                 example: "Santiago"
 *               ciudad_destino:
 *                 type: string
 *                 example: "Viña del Mar"
 *               fecha_viaje:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-20"
 *               hora_salida:
 *                 type: string
 *                 example: "10:00"
 *               tarifa_base:
 *                 type: integer
 *                 example: 55000
 *     responses:
 *       201:
 *         description: Evento de cambio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento origen no encontrado
 */
router.post('/cambio', validate(eventoValidation.crearCambio), eventosController.crearCambio);

/**
 * @openapi
 * /api/eventos/devolucion:
 *   post:
 *     summary: Crear evento de devolución
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evento_origen_id
 *               - monto_devolucion
 *             properties:
 *               evento_origen_id:
 *                 type: integer
 *                 example: 100
 *               monto_devolucion:
 *                 type: integer
 *                 example: 20000
 *     responses:
 *       201:
 *         description: Evento de devolución creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento origen no encontrado
 */
router.post('/devolucion', validate(eventoValidation.crearDevolucion), eventosController.crearDevolucion);

/**
 * @openapi
 * /api/eventos/{id}/historial:
 *   get:
 *     summary: Obtener historial completo de una cadena de eventos
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Historial de la cadena
 */
router.get('/:id/historial', eventosController.obtenerHistorial);

/**
 * @openapi
 * /api/eventos/{id}/actual:
 *   get:
 *     summary: Obtener el estado actual (último evento) de una cadena
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/:id/actual', eventosController.obtenerEventoActual);

/**
 * @openapi
 * /api/eventos:
 *   get:
 *     summary: Listar todos los eventos
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: tipo_evento
 *         schema: { type: string, enum: [COMPRA, CAMBIO, DEVOLUCION] }
 *       - in: query
 *         name: empresa_id
 *         schema: { type: integer }
  *       - in: query
 *         name: rut
 *         schema: { type: string }
 *       - in: query
 *         name: pnr
 *         schema: { type: string }
 *       - in: query
 *         name: numero_ticket
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista paginada de eventos
 */
router.get('/', eventosController.listar);
router.get('/:id', eventosController.obtener);
router.delete('/:id', eventosController.eliminar);
/**
 * @openapi
 * /api/eventos/pasajero/{rut}:
 *   get:
 *     summary: Listar eventos por RUT de pasajero
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *         description: RUT del pasajero
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de eventos del pasajero
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems: { type: integer }
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evento'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pasajero no encontrado
 */
router.get('/pasajero/:rut', eventosController.listarPorRut);

/**
 * @openapi
 * /api/eventos/buscar:
 *   post:
 *     summary: Buscar eventos por filtros en payload (RUT, PNR)
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rut
 *               - pnr
 *             properties:
 *               rut:
 *                 type: string
 *                 example: "12345678-9"
 *               pnr:
 *                 type: string
 *                 example: "ABCDEF"
 *     responses:
 *       200:
 *         description: Lista de eventos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems: { type: integer }
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evento'
 *       401:
 *         description: No autorizado
 */
router.post('/buscar', eventosController.buscar);

module.exports = router;
