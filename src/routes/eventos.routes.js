const { Router } = require('express');
const eventosController = require('../controllers/eventos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Eventos
 *   description: Gestión de eventos (viajes)
 */

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @openapi
 * /api/eventos/compra:
 *   post:
 *     summary: Crear evento de compra
 *     tags:
 *       - Eventos
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
 *               - pasajero_id
 *               - empresa_id
 *               - ciudad_origen
 *               - ciudad_destino
 *               - fecha_viaje
 *               - tarifa_base
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 example: 1
 *               pasajero_id:
 *                 type: integer
 *                 example: 1
 *               empresa_id:
 *                 type: integer
 *                 example: 1
 *               convenio_id:
 *                 type: integer
 *                 example: 1
 *               codigo_descuento_id:
 *                 type: integer
 *                 example: 1
 *               ciudad_origen:
 *                 type: string
 *                 example: Santiago
 *               ciudad_destino:
 *                 type: string
 *                 example: Valparaíso
 *               fecha_viaje:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-15"
 *               numero_asiento:
 *                 type: string
 *                 example: "A12"
 *               tarifa_base:
 *                 type: integer
 *                 example: 50000
 *     responses:
 *       201:
 *         description: Evento de compra creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 */
router.post('/compra', eventosController.crearCompra);

/**
 * @openapi
 * /api/eventos/cambio:
 *   post:
 *     summary: Crear evento de cambio
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
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
 *               - tarifa_base
 *             properties:
 *               evento_origen_id:
 *                 type: integer
 *                 example: 100
 *                 description: ID del evento de compra original
 *               usuario_id:
 *                 type: integer
 *                 example: 1
 *                 description: Opcional, se usa el del evento origen si no se proporciona
 *               ciudad_origen:
 *                 type: string
 *                 example: Santiago
 *               ciudad_destino:
 *                 type: string
 *                 example: Viña del Mar
 *               fecha_viaje:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-20"
 *               numero_asiento:
 *                 type: string
 *                 example: "B15"
 *               tarifa_base:
 *                 type: integer
 *                 example: 55000
 *     responses:
 *       201:
 *         description: Evento de cambio creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 */
router.post('/cambio', eventosController.crearCambio);

/**
 * @openapi
 * /api/eventos/devolucion:
 *   post:
 *     summary: Crear evento de devolución
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evento_origen_id
 *             properties:
 *               evento_origen_id:
 *                 type: integer
 *                 example: 100
 *                 description: ID del evento de compra original
 *               usuario_id:
 *                 type: integer
 *                 example: 1
 *                 description: Opcional, se usa el del evento origen si no se proporciona
 *               monto_devolucion:
 *                 type: integer
 *                 example: 20000
 *                 description: Opcional, se usa el monto_pagado del evento origen si no se proporciona
 *     responses:
 *       201:
 *         description: Evento de devolución creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 */
router.post('/devolucion', eventosController.crearDevolucion);

/**
 * @openapi
 * /api/eventos:
 *   get:
 *     summary: Listar eventos
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo_evento
 *         schema:
 *           type: string
 *           enum: [COMPRA, CAMBIO, DEVOLUCION]
 *         description: Filtrar por tipo de evento
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *         description: Filtrar por empresa
 *       - in: query
 *         name: pasajero_id
 *         schema:
 *           type: integer
 *         description: Filtrar por pasajero
 *       - in: query
 *         name: convenio_id
 *         schema:
 *           type: integer
 *         description: Filtrar por convenio
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Orden de la clasificación
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evento'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */
router.get('/', eventosController.listar);

/**
 * @openapi
 * /api/eventos/{id}:
 *   get:
 *     summary: Obtener evento por ID
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:id', eventosController.obtener);

/**
 * @openapi
 * /api/eventos/{id}:
 *   delete:
 *     summary: Eliminar evento (soft delete)
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       204:
 *         description: Evento eliminado exitosamente
 */
router.delete('/:id', eventosController.eliminar);

/**
 * @openapi
 * /api/eventos/pasajero/{rut}:
 *   get:
 *     summary: Listar eventos por RUT de pasajero
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
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
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de eventos del pasajero
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evento'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       404:
 *         description: Pasajero no encontrado
 */
router.get('/pasajero/:rut', eventosController.listarPorRut);

module.exports = router;
