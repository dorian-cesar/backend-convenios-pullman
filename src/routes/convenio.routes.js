const { Router } = require('express');
const convenioController = require('../controllers/convenio.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { crearConvenio, actualizarConvenio, validarCodigoConvenio } = require('../validations/convenio.validation');

const router = Router();

// Todas las rutas requieren autenticación (JWT o API Key)
router.use(authMiddleware);




/**
 * @openapi
 * tags:
 *   name: Convenios
 *   description: Gestión de convenios empresariales
 */

// Endpoint público para listar convenios
router.get('/', convenioController.listar);

/**
 * @openapi
 * /api/convenios/validar/{codigo}:
 *   get:
 *     summary: Validar convenio por CÓDIGO
 *     description: Retorna los detalles del convenio si el código es válido y está activo.
 *     tags:
 *       - Convenios
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de descuento a validar
 *     responses:
 *       200:
 *         description: Convenio válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 *       404:
 *         description: Código inválido o inactivo
 */
router.get('/validar/:codigo', convenioController.validarPorCodigo);

/**
 * @openapi
 * /api/convenios/validar/{codigo}:
 *   post:
 *     summary: Validar si un código pertenece a un Convenio específico
 *     description: Verifica que el código ingresado exista, esté activo y pertenezca al ID de convenio enviado en el body.
 *     tags:
 *       - Convenios
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de descuento a validar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               convenio_id:
 *                 type: integer
 *                 example: 3
 *                 description: ID del convenio al cual debe pertenecer el código
 *     responses:
 *       200:
 *         description: Convenio y código válidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 *       400:
 *         description: No se proporcionó convenio_id
 *       404:
 *         description: Código no válido para el convenio solicitado
 */
router.post('/validar/:codigo', validate(validarCodigoConvenio), convenioController.validarCodigoPorConvenio);

/**
 * @openapi
 * /api/convenios/activos:
 *   get:
 *     summary: Listar solo convenios activos y vigentes
 *     description: Retorna convenios que están ACTIVOS, tienen descuento ACTIVO y empresa ACTIVA.
 *     tags:
 *       - Convenios
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de convenios activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Convenio'
 */
// Endpoint público para listar convenios ACTIVOS (solo status)
router.get('/activos', convenioController.listarActivos);

/**
 * @openapi
 * /api/convenios/disponibles:
 *   get:
 *     summary: Listar convenios DISPONIBLES (Vigentes + Cupo + Monto)
 *     description: Retorna convenios que están ACTIVOS, dentro de rango de fechas, y tienen cupo/monto disponible.
 *     tags:
 *       - Convenios
 *     responses:
 *       200:
 *         description: Lista de convenios disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Convenio'
 */
router.get('/disponibles', convenioController.listarDisponibles);

// Rutas protegidas (Ya lo son todas)

/**
 * @openapi
 * /api/convenios:
 *   get:
 *     description: Retorna lista de convenios con detalles de configuración.
 *     tags:
 *       - Convenios
 *     security: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre exacto
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: integer
 *         description: Filtrar por empresa
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *         description: Filtrar por estado
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
 *     responses:
 *       200:
 *         description: Lista de convenios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Convenio'
 *   post:
 *     summary: Crear un nuevo convenio
 *     tags:
 *       - Convenios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - empresa_id
 *               - codigo
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Convenio Verano 2026"
 *               empresa_id:
 *                 type: integer
 *                 example: 1
 *               codigo:
 *                 type: string
 *                 example: "PROMO2026"
 *                 description: "Código de descuento (OBLIGATORIO para convenios internos)"
 *               tipo_consulta:
 *                 type: string
 *                 enum: [API_EXTERNA, CODIGO_DESCUENTO]
 *                 default: CODIGO_DESCUENTO
 *               porcentaje_descuento:
 *                 type: integer
 *                 example: 10
 *                 description: "Porcentaje de descuento (0-100)"
 *               endpoint:
 *                 type: string
 *                 description: "Ruta del servicio (Solo para API_EXTERNA)"
 *                 example: "/api/integraciones/araucana/validar"
 *               tope_monto_descuento:
 *                 type: integer
 *                 example: 1000000
 *               tope_cantidad_tickets:
 *                 type: integer
 *                 example: 50
 *               limitar_por_stock:
 *                 type: boolean
 *                 example: false
 *               limitar_por_monto:
 *                 type: boolean
 *                 example: false
 *               api_url_id:
 *                 type: integer
 *                 example: 1
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *               fecha_termino:
 *                 type: string
 *                 format: date-time
 *           examples:
 *             CodigoDescuento:
 *               summary: Convenio de Código (Default)
 *               value:
 *                 nombre: "Convenio Verano 2026"
 *                 empresa_id: 1
 *                 tipo_consulta: "CODIGO_DESCUENTO"
 *                 codigo: "VERANO2026"
 *                 porcentaje_descuento: 10
 *                 tope_monto_descuento: 1000000
 *                 tope_cantidad_tickets: 50
 *             ApiExterna:
 *               summary: Convenio con API Externa
 *               value:
 *                 nombre: "Convenio Araucana"
 *                 empresa_id: 2
 *                 tipo_consulta: "API_EXTERNA"
 *                 endpoint: "https://api.externa.com/validar"
 *     responses:
 *       201:
 *         description: Convenio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 */
router.post('/', validate(crearConvenio), convenioController.crear);



/**
 * @openapi
 * /api/convenios/{id}/disponibilidad:
 *   get:
 *     summary: Verificar disponibilidad de un convenio
 *     description: Valida fechas, tickets y montos restantes. Si no hay disponibilidad, devuelve error descriptivo.
 *     tags:
 *       - Convenios
 *     security:
 *       - ApiKeyAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del convenio a verificar
 *     responses:
 *       200:
 *         description: Estado de disponibilidad del convenio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valido:
 *                   type: boolean
 *                   example: true
 *                 nombre:
 *                   type: string
 *                   example: "Convenio Promo"
 *                 empresa:
 *                   type: string
 *                   example: "Empresa S.A."
 *                 tickets_disponibles:
 *                   type: integer
 *                   example: 10
 *                   nullable: true
 *                 monto_disponible:
 *                   type: integer
 *                   example: 450000
 *                   nullable: true
 *       400:
 *         description: El convenio está inactivo, caducado o sin fondos/tickets
 *       404:
 *         description: Convenio no encontrado
 */
router.get('/:id/disponibilidad', convenioController.verificarDisponibilidad);

/**
 * @openapi
 * /api/convenios/{id}:
 *   get:
 *     summary: Obtener convenio por ID
 *     tags:
 *       - Convenios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del convenio
 *     responses:
 *       200:
 *         description: Convenio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 *       404:
 *         description: Convenio no encontrado
 */
router.get('/:id', convenioController.obtener);

/**
 * @openapi
 * /api/convenios/{id}:
 *   put:
 *     summary: Actualizar convenio
 *     tags:
 *       - Convenios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del convenio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Convenio Invierno 2026
 *               empresa_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *                 example: ACTIVO
 *               porcentaje_descuento:
 *                 type: integer
 *                 example: 15
 *               codigo:
 *                 type: string
 *                 example: "INVIERNO2026"
 *               limitar_por_stock:
 *                 type: boolean
 *                 example: true
 *               limitar_por_monto:
 *                 type: boolean
 *                 example: false
 *               api_url_id:
 *                 type: integer
 *                 example: 1
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *               fecha_termino:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Convenio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 *       404:
 *         description: Convenio no encontrado
 */
router.put('/:id', validate(actualizarConvenio), convenioController.actualizar);

/**
 * @openapi
 * /api/convenios/{id}:
 *   delete:
 *     summary: Eliminar convenio (soft delete)
 *     tags:
 *       - Convenios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del convenio
 *     responses:
 *       204:
 *         description: Convenio eliminado exitosamente
 */
router.delete('/:id', convenioController.eliminar);

/**
 * @openapi
 * /api/convenios/{id}/consumo:
 *   patch:
 *     summary: Actualizar acumulado de consumo manualmente
 *     description: Permite setear manualmente los valores de consumo_tickets y consumo_monto_descuento.
 *     tags:
 *       - Convenios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consumo_tickets:
 *                 type: integer
 *                 example: 10
 *               consumo_monto_descuento:
 *                 type: integer
 *                 example: 50000
 *     responses:
 *       200:
 *         description: Consumo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 */
router.patch('/:id/consumo', authMiddleware, convenioController.actualizarConsumo);

module.exports = router;
