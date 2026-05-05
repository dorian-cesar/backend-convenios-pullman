const { Convenio, Empresa, ApiConsulta, ApiRegistro, Evento, Beneficiario, Categoria, sequelize } = require('../models');
const { Op } = require('sequelize');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

/**
 * Crear convenio
 */
exports.crearConvenio = async ({ nombre, empresa_id, tipo, endpoint, api_consulta_id, tope_monto_descuento, tope_cantidad_tickets, porcentaje_descuento, tipo_alcance, tipo_descuento, valor_descuento, codigo, limitar_por_stock, limitar_por_monto, fecha_inicio, fecha_termino, beneficio, imagenes, rutas, configuraciones }) => {
    if (!nombre || !empresa_id) {
        throw new BusinessError('Nombre y empresa_id son obligatorios');
    }

    // Verificar que la empresa existe
    const empresa = await Empresa.findByPk(empresa_id);
    if (!empresa) {
        throw new NotFoundError('Empresa no encontrada');
    }

    let finalApiConsultaId = api_consulta_id;
    let finalEndpoint = endpoint;
    let finalCodigo = codigo;

    // Lógica para asignar/crear ApiConsulta según el tipo
    if (tipo === 'CODIGO_DESCUENTO') {
        if (!finalCodigo) {
            throw new BusinessError('Para CODIGO_DESCUENTO se requiere un código');
        }
        // Usar endpoint de plantilla genérico para todos los códigos internos
        finalEndpoint = `/api/convenios/validar/{codigo}`;

        // Crear/Obtener la configuración de API interna genérica
        const [api] = await ApiConsulta.findOrCreate({
            where: { endpoint: finalEndpoint },
            defaults: { nombre: 'Validación de Códigos Internos', status: 'ACTIVO' }
        });
        finalApiConsultaId = api.id;
    } else if (tipo === 'API_EXTERNA') {
        // Regla: En API_EXTERNA el código debe ser NULL
        if (codigo !== undefined && codigo !== null) {
            throw new BusinessError('El código debe ser null para convenios de tipo API_EXTERNA');
        }
        finalCodigo = null;

        if (finalApiConsultaId) {
            // Si pasan el ID directamente, validar que pertenezca a la misma empresa
            const api = await ApiConsulta.findByPk(finalApiConsultaId);
            if (!api) {
                throw new NotFoundError('API de consulta no encontrada');
            }
            // Validar empresa (si la API tiene empresa_id asociada)
            if (api.empresa_id && api.empresa_id !== parseInt(empresa_id)) {
                throw new BusinessError('La API de consulta seleccionada no pertenece a la empresa del convenio');
            }
            finalEndpoint = api.endpoint;
        } else if (endpoint) {
            // Retrocompatibilidad/Creación al vuelo: Asociar a la empresa
            const [api] = await ApiConsulta.findOrCreate({
                where: { endpoint: endpoint, empresa_id: empresa_id },
                defaults: { nombre: `API ${nombre}`, status: 'ACTIVO' }
            });
            finalApiConsultaId = api.id;
            finalEndpoint = endpoint;
        } else {
            throw new BusinessError('Para API_EXTERNA se requiere un endpoint o el ID de una API de consulta');
        }
    }

    // Lógica de Estado Inicial basado en fechas
    let statusInicial = 'ACTIVO';
    const hoy = new Date();
    if (fecha_inicio) {
        const inicio = new Date(fecha_inicio);
        if (hoy < inicio) statusInicial = 'INACTIVO';
    }
    if (fecha_termino) {
        const termino = new Date(fecha_termino);
        termino.setHours(23, 59, 59, 999);
        if (hoy > termino) statusInicial = 'INACTIVO';
    }

    // Lógica de compatibilidad hacia atrás Fase 3
    let finalValorDescuento = valor_descuento;
    let finalTipoDescuento = tipo_descuento || 'Porcentaje';
    let finalTipoAlcance = tipo_alcance || 'Global';

    // Si mandan porcentaje_descuento (Front viejo) pero no mandan el nuevo payload
    if (porcentaje_descuento !== undefined && valor_descuento === undefined) {
        finalValorDescuento = porcentaje_descuento;
        finalTipoDescuento = 'Porcentaje';
    }

    // Validaciones según el tipo de alcance
    if (finalTipoAlcance === 'Rutas Especificas') {
        // REGLA: Si es por ruta, el tipo de descuento DEBE ser Tarifa Plana
        finalTipoDescuento = 'Tarifa Plana';

        // Validar que al menos haya una configuración de valor_ida (Global o en la primera ruta)
        const globalConfig = Array.isArray(configuraciones) ? configuraciones[0] : configuraciones;
        const hasGlobalValorIda = globalConfig && ((globalConfig.valor_ida !== undefined && globalConfig.valor_ida !== null) || (globalConfig.precio_solo_ida !== undefined && globalConfig.precio_solo_ida !== null));
        const firstRoute = (Array.isArray(rutas) && rutas.length > 0) ? rutas[0] : null;
        const routeConfig = firstRoute && (Array.isArray(firstRoute.configuraciones) ? firstRoute.configuraciones[0] : firstRoute.configuraciones);
        const hasRouteValorIda = routeConfig && ((routeConfig.valor_ida !== undefined && routeConfig.valor_ida !== null) || (routeConfig.precio_solo_ida !== undefined && routeConfig.precio_solo_ida !== null));

        if (!hasGlobalValorIda && !hasRouteValorIda) {
            throw new BusinessError('Para convenios por rutas, el valor de ida es obligatorio (ya sea global o por ruta específica)');
        }

        // Sincronizar valor_descuento con el primer valor_ida o precio_solo_ida encontrado para mantener consistencia legacy
        if (hasGlobalValorIda) {
            finalValorDescuento = globalConfig.valor_ida !== undefined && globalConfig.valor_ida !== null ? globalConfig.valor_ida : globalConfig.precio_solo_ida;
        } else if (hasRouteValorIda) {
            finalValorDescuento = routeConfig.valor_ida !== undefined && routeConfig.valor_ida !== null ? routeConfig.valor_ida : routeConfig.precio_solo_ida;
        }
    }

    const convenio = await Convenio.create({
        nombre,
        empresa_id,
        tipo: tipo || 'CODIGO_DESCUENTO',
        api_consulta_id: finalApiConsultaId,
        tope_monto_descuento,
        tope_cantidad_tickets,
        tipo_alcance: finalTipoAlcance,
        tipo_descuento: finalTipoDescuento,
        valor_descuento: finalValorDescuento,
        codigo: finalCodigo,
        limitar_por_stock: limitar_por_stock || false,
        limitar_por_monto: limitar_por_monto || false,
        fecha_inicio,
        fecha_termino,
        status: statusInicial,
        beneficio: beneficio || false,
        imagenes: imagenes || [],
        rutas: rutas || null,
        configuraciones: configuraciones || null
    });


    return await Convenio.findByPk(convenio.id, {
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa'],
                include: [
                    {
                        model: ApiRegistro,
                        as: 'apisRegistro',
                        required: false,
                        where: { status: 'ACTIVO' },
                        attributes: ['id', 'nombre', 'endpoint']
                    }
                ]
            },
            {
                model: ApiConsulta,
                as: 'apiConsulta',
                attributes: ['id', 'nombre', 'endpoint']
            },
            {
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre']
            }
        ],
        attributes: {
            include: [
                [
                    sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM beneficiarios AS b
                        WHERE b.convenio_id = Convenio.id
                        AND b.deletedAt IS NULL
                    )`),
                    'total_beneficiarios'
                ]
            ]
        }
    });
};

/**
 * Listar convenios
 */
exports.listarConvenios = async (filters = {}) => {
    const { page, limit, sortBy, order, status, ...otherFilters } = filters;
    const { offset, limit: limitVal } = getPagination(page, limit);
    const where = {};

    if (status || otherFilters.status) {
        where.status = status || otherFilters.status;
    }

    if (otherFilters.empresa_id) {
        where.empresa_id = otherFilters.empresa_id;
    }

    if (otherFilters.id) {
        where.id = otherFilters.id;
    }

    if (otherFilters.nombre) {
        where.nombre = otherFilters.nombre;
    }

    const sortField = sortBy || 'id';
    const sortOrder = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    const data = await Convenio.findAndCountAll({
        where,
        distinct: true, // Asegurar conteo de IDs únicos
        attributes: {
            include: [
                [
                    sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM beneficiarios AS b
                        WHERE b.convenio_id = Convenio.id
                        AND b.deletedAt IS NULL
                    )`),
                    'total_beneficiarios'
                ]
            ]
        },
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa'],
                include: [
                    {
                        model: ApiRegistro,
                        as: 'apisRegistro',
                        required: false,
                        where: { status: 'ACTIVO' },
                        attributes: ['id', 'nombre', 'endpoint']
                    }
                ]
            },
            {
                model: ApiConsulta,
                as: 'apiConsulta',
                attributes: ['id', 'nombre', 'endpoint']
            },
            {
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre']
            }
        ],
        order: [[sortField, sortOrder]],
        limit: limitVal,
        offset
    });

    return getPagingData(data, page, limitVal);
};

/**
 * Listar convenios activos con descuentos activos
 */
exports.listarActivos = async (filters = {}) => {
    const { page, limit } = filters;
    const { offset, limit: limitVal } = getPagination(page, limit);

    const hoy = new Date();
    const where = {
        status: 'ACTIVO',
        [Op.or]: [
            { fecha_inicio: { [Op.eq]: null } },
            { fecha_inicio: { [Op.lte]: hoy } }
        ],
        [Op.and]: [
            {
                [Op.or]: [
                    { fecha_termino: { [Op.eq]: null } },
                    { fecha_termino: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } }
                ]
            }
        ]
    };

    const data = await Convenio.findAndCountAll({
        where,
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa'],
                required: true,
                where: { status: 'ACTIVO' },
                include: [
                    {
                        model: ApiRegistro,
                        as: 'apisRegistro',
                        required: false,
                        where: { status: 'ACTIVO' },
                        attributes: ['id', 'nombre', 'endpoint']
                    }
                ]
            },
            {
                model: ApiConsulta,
                as: 'apiConsulta',
                attributes: ['id', 'nombre', 'endpoint']
            }
        ],
        limit: limitVal,
        offset,
        order: [['nombre', 'ASC']]
    });

    return getPagingData(data, page, limitVal);
};

/**
 * Obtener convenio por ID
 */
exports.obtenerConvenio = async (id) => {
    const convenio = await Convenio.findByPk(id, {
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa'],
                include: [
                    {
                        model: ApiRegistro,
                        as: 'apisRegistro',
                        required: false,
                        where: { status: 'ACTIVO' },
                        attributes: ['id', 'nombre', 'endpoint']
                    }
                ]
            },
            {
                model: ApiConsulta,
                as: 'apiConsulta',
                attributes: ['id', 'nombre', 'endpoint']
            },
            {
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre']
            }
        ],
        attributes: {
            include: [
                [
                    sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM beneficiarios AS b
                        WHERE b.convenio_id = Convenio.id
                        AND b.deletedAt IS NULL
                    )`),
                    'total_beneficiarios'
                ]
            ]
        }
    });

    if (!convenio) {
        throw new NotFoundError('Convenio no encontrado');
    }

    // Validación Lazy de Vigencia
    await exports.validarVigencia(id);

    // Recargar para obtener el status actualizado si cambió
    await convenio.reload();

    return convenio;
};

/**
 * Actualizar convenio
 */
exports.actualizarConvenio = async (id, datos) => {
    const convenio = await Convenio.findByPk(id);

    if (!convenio) {
        throw new NotFoundError('Convenio no encontrado');
    }

    const {
        nombre, status, empresa_id, porcentaje_descuento, codigo,
        tipo_alcance, tipo_descuento, valor_descuento,
        limitar_por_stock, limitar_por_monto, fecha_inicio, fecha_termino,
        tipo, api_consulta_id, tope_monto_descuento, tope_cantidad_tickets,
        beneficio, imagenes, rutas, configuraciones
    } = datos;

    if (nombre) convenio.nombre = nombre;
    if (status) convenio.status = status;

    // Asignación de nuevos campos
    if (tipo_alcance !== undefined) convenio.tipo_alcance = tipo_alcance;
    if (tipo_descuento !== undefined) convenio.tipo_descuento = tipo_descuento;
    if (valor_descuento !== undefined) convenio.valor_descuento = valor_descuento;

    // Lógica retrocompatibilidad (solo si mandan campo viejo sin el nuevo)
    if (porcentaje_descuento !== undefined && valor_descuento === undefined) {
        convenio.valor_descuento = porcentaje_descuento;
        convenio.tipo_descuento = 'Porcentaje';
    }

    const finalTipo = tipo !== undefined ? tipo : convenio.tipo;
    if (finalTipo === 'API_EXTERNA' && codigo !== undefined && codigo !== null) {
        throw new BusinessError('El código debe ser null para convenios de tipo API_EXTERNA');
    }

    if (codigo !== undefined) convenio.codigo = finalTipo === 'API_EXTERNA' ? null : codigo;
    if (limitar_por_stock !== undefined) convenio.limitar_por_stock = limitar_por_stock;
    if (limitar_por_monto !== undefined) convenio.limitar_por_monto = limitar_por_monto;
    // Asignación de rutas y configuraciones (si vienen en el payload, se guardan)
    if (rutas !== undefined) convenio.rutas = rutas;
    if (configuraciones !== undefined) convenio.configuraciones = configuraciones;

    // Lógica específica por alcance
    const alcanceFinal = tipo_alcance !== undefined ? tipo_alcance : convenio.tipo_alcance;
    if (alcanceFinal === 'Rutas Especificas') {
        // REGLA: Forzar Tarifa Plana
        convenio.tipo_descuento = 'Tarifa Plana';

        const configActual = Array.isArray(convenio.configuraciones) ? convenio.configuraciones[0] : convenio.configuraciones;
        const rutasActuales = convenio.rutas;

        // Validar que al menos haya una configuración de valor_ida o precio_solo_ida (Global o en la primera ruta)
        const hasGlobalValorIda = configActual && ((configActual.valor_ida !== undefined && configActual.valor_ida !== null) || (configActual.precio_solo_ida !== undefined && configActual.precio_solo_ida !== null));
        const firstRoute = (Array.isArray(rutasActuales) && rutasActuales.length > 0) ? rutasActuales[0] : null;
        const routeConfig = firstRoute && (Array.isArray(firstRoute.configuraciones) ? firstRoute.configuraciones[0] : firstRoute.configuraciones);
        const hasRouteValorIda = routeConfig && ((routeConfig.valor_ida !== undefined && routeConfig.valor_ida !== null) || (routeConfig.precio_solo_ida !== undefined && routeConfig.precio_solo_ida !== null));

        if (!hasGlobalValorIda && !hasRouteValorIda) {
            throw new BusinessError('Para convenios por rutas, el valor de ida es obligatorio (ya sea global o por ruta específica)');
        }

        // Sincronizar valor_descuento
        if (hasGlobalValorIda) {
            convenio.valor_descuento = configActual.valor_ida !== undefined && configActual.valor_ida !== null ? configActual.valor_ida : configActual.precio_solo_ida;
        } else if (hasRouteValorIda) {
            convenio.valor_descuento = routeConfig.valor_ida !== undefined && routeConfig.valor_ida !== null ? routeConfig.valor_ida : routeConfig.precio_solo_ida;
        }
    }

    if (beneficio !== undefined) convenio.beneficio = beneficio;
    if (imagenes !== undefined) convenio.imagenes = imagenes;

    // Nuevos campos para actualización
    if (fecha_inicio !== undefined) convenio.fecha_inicio = fecha_inicio;
    if (fecha_termino !== undefined) convenio.fecha_termino = fecha_termino;
    if (tipo !== undefined) convenio.tipo = tipo;
    if (api_consulta_id !== undefined) {
        if (api_consulta_id) {
            const api = await ApiConsulta.findByPk(api_consulta_id);
            if (!api) throw new NotFoundError('API de consulta no encontrada');
        }
        convenio.api_consulta_id = api_consulta_id;
    }
    if (tope_monto_descuento !== undefined) convenio.tope_monto_descuento = tope_monto_descuento;
    if (tope_cantidad_tickets !== undefined) convenio.tope_cantidad_tickets = tope_cantidad_tickets;

    if (empresa_id) {
        const empresa = await Empresa.findByPk(empresa_id);
        if (!empresa) {
            throw new NotFoundError('Empresa no encontrada');
        }
        convenio.empresa_id = empresa_id;
    }

    const fInicio = fecha_inicio !== undefined ? fecha_inicio : convenio.fecha_inicio;
    const fTermino = fecha_termino !== undefined ? fecha_termino : convenio.fecha_termino;

    // Validar fechas para forzar INACTIVO si corresponde
    const hoy = new Date();
    let forzarInactivo = false;

    if (fInicio) {
        const inicio = new Date(fInicio);
        if (hoy < inicio) forzarInactivo = true;
    }
    if (fTermino) {
        const termino = new Date(fTermino);
        termino.setHours(23, 59, 59, 999);
        if (hoy > termino) forzarInactivo = true;
    }

    if (forzarInactivo) {
        convenio.status = 'INACTIVO';
    } else {
        if (status) {
            convenio.status = status;
        }
    }

    await convenio.save();

    // Recargar con relaciones
    return await Convenio.findByPk(id, {
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa'],
                include: [
                    {
                        model: ApiRegistro,
                        as: 'apisRegistro',
                        required: false,
                        where: { status: 'ACTIVO' },
                        attributes: ['id', 'nombre', 'endpoint']
                    }
                ]
            },
            {
                model: ApiConsulta,
                as: 'apiConsulta',
                attributes: ['id', 'nombre', 'endpoint']
            },
            {
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre']
            }
        ],
        attributes: {
            include: [
                [
                    sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM beneficiarios AS b
                        WHERE b.convenio_id = Convenio.id
                        AND b.deletedAt IS NULL
                    )`),
                    'total_beneficiarios'
                ]
            ]
        }
    });
};

/**
 * Eliminar convenio (soft delete)
 */
exports.eliminarConvenio = async (id) => {
    const convenio = await Convenio.findByPk(id);

    if (!convenio) {
        throw new NotFoundError('Convenio no encontrado');
    }

    convenio.status = 'INACTIVO';
    await convenio.save();

    return convenio;
};

/**
 * Verificar si una nueva venta excede los límites del convenio
 */
exports.verificarLimites = async (convenioId, montoNuevo = 0) => {
    const convenio = await Convenio.findByPk(convenioId);
    if (!convenio) {
        throw new NotFoundError('Convenio no encontrado');
    }

    // 0. Validar Vigencia (Fechas)
    const isVigente = await exports.validarVigencia(convenioId);
    if (!isVigente) {
        throw new BusinessError('El convenio ha expirado o se encuentra inactivo.');
    }

    // Si no tienes controles de topes activos, pase
    if (!convenio.limitar_por_stock && !convenio.limitar_por_monto) {
        return true;
    }

    const { consumo_monto_descuento, consumo_tickets, tope_monto_descuento, tope_cantidad_tickets } = convenio;

    console.log(`[Convenio Check] ID: ${convenioId} | Descuento Acumulado: ${consumo_monto_descuento} + Nuevo: ${montoNuevo} vs Tope: ${tope_monto_descuento}`);
    console.log(`[Convenio Check] ID: ${convenioId} | Tickets Acumulados: ${consumo_tickets} + 1 vs Tope: ${tope_cantidad_tickets}`);

    // 3. Verificaciones
    if (convenio.limitar_por_monto && tope_monto_descuento) {
        if ((consumo_monto_descuento + montoNuevo) > tope_monto_descuento) {
            throw new BusinessError(`Límite de monto de descuento excedido. Tope: $${tope_monto_descuento}, Usado: $${consumo_monto_descuento}, Intento: $${montoNuevo}`);
        }
    }

    if (convenio.limitar_por_stock && tope_cantidad_tickets) {
        if ((consumo_tickets + 1) > tope_cantidad_tickets) {
            throw new BusinessError(`Límite de cantidad de tickets excedido. Tope: ${tope_cantidad_tickets}, Actual: ${consumo_tickets}`);
        }
    }

    return true;
};

/**
 * Validar convenio por código (Endpoint interno)
 */
exports.validarPorCodigo = async (codigo) => {
    const convenio = await Convenio.findOne({
        where: { codigo, status: 'ACTIVO' },
        include: [{
            model: Empresa,
            as: 'empresa',
            attributes: ['id', 'nombre', 'rut_empresa']
        }]
    });

    if (!convenio) {
        throw new NotFoundError('Código de descuento no válido o inactivo');
    }

    const hoy = new Date();

    // 1. Validar Fechas
    if (convenio.fecha_inicio && new Date(convenio.fecha_inicio) > hoy) {
        throw new BusinessError('El convenio aún no comienza su vigencia');
    }
    if (convenio.fecha_termino) {
        const termino = new Date(convenio.fecha_termino);
        termino.setHours(23, 59, 59, 999);
        if (hoy > termino) {
            throw new BusinessError('El convenio ha expirado');
        }
    }

    // 2. Validar Monto
    if (convenio.tope_monto_descuento !== null && convenio.consumo_monto_descuento >= convenio.tope_monto_descuento) {
        throw new BusinessError('El convenio ha agotado su fondo de descuentos');
    }

    // 3. Validar Stock
    if (convenio.tope_cantidad_tickets !== null && convenio.consumo_tickets >= convenio.tope_cantidad_tickets) {
        throw new BusinessError('El convenio ha agotado su stock de uso');
    }

    return convenio;
};

/**
 * Validar si un código específico pertenece a un convenio por su ID
 */
exports.validarCodigoPorConvenio = async (convenioId, codigo) => {
    const convenio = await Convenio.findOne({
        where: { id: convenioId, codigo, status: 'ACTIVO' },
        include: [{
            model: Empresa,
            as: 'empresa',
            attributes: ['id', 'nombre', 'rut_empresa']
        }]
    });

    if (!convenio) {
        throw new BusinessError('El código ingresado no pertenece a este convenio, o se encuentra inactivo');
    }

    const hoy = new Date();

    if (convenio.fecha_inicio && new Date(convenio.fecha_inicio) > hoy) {
        throw new BusinessError('El convenio aún no comienza su vigencia');
    }
    if (convenio.fecha_termino) {
        const termino = new Date(convenio.fecha_termino);
        termino.setHours(23, 59, 59, 999);
        if (hoy > termino) {
            throw new BusinessError('El convenio ha expirado');
        }
    }

    if (convenio.tope_monto_descuento !== null && convenio.consumo_monto_descuento >= convenio.tope_monto_descuento) {
        throw new BusinessError('El convenio ha agotado su fondo de descuentos');
    }

    if (convenio.tope_cantidad_tickets !== null && convenio.consumo_tickets >= convenio.tope_cantidad_tickets) {
        throw new BusinessError('El convenio ha agotado su stock de uso');
    }

    return convenio;
};


/**
 * Verificar vigencia del convenio
 * Retorna true si está vigente, false si expiró (y actualiza el status)
 */
exports.validarVigencia = async (convenioId) => {
    const convenio = await Convenio.findByPk(convenioId);
    if (!convenio) return false;

    if (convenio.status === 'INACTIVO') return false;

    // Verificar fecha término
    if (convenio.fecha_termino) {
        const fechaTermino = new Date(convenio.fecha_termino);
        fechaTermino.setHours(23, 59, 59, 999);

        const hoy = new Date();

        if (hoy > fechaTermino) {
            convenio.status = 'INACTIVO';
            await convenio.save();

            return false;
        }
    }

    // Verificar fecha inicio
    if (convenio.fecha_inicio) {
        const fechaInicio = new Date(convenio.fecha_inicio);
        const hoy = new Date();
        if (hoy < fechaInicio) {
            convenio.status = 'INACTIVO';
            await convenio.save();
            return false;
        }
    }

    return true;
};

/**
 * Verificar disponibilidad explícita por ID (Stock, Fechas, Montos)
 */
exports.verificarDisponibilidadPorId = async (id) => {
    const convenio = await Convenio.findByPk(id, {
        include: [{
            model: Empresa,
            as: 'empresa',
            attributes: ['id', 'nombre', 'rut_empresa']
        }]
    });

    if (!convenio) {
        return {
            valido: false,
            nombre: null,
            empresa: null,
            tickets_disponibles: null,
            monto_disponible: null,
            msj: 'Convenio no encontrado'
        };
    }

    const hoy = new Date();

    let response = {
        valido: true,
        nombre: convenio.nombre,
        empresa: convenio.empresa ? convenio.empresa.nombre : null,
        tickets_disponibles: null,
        monto_disponible: null,
        msj: "hay disponibilidad y el convenio está activo"
    };

    if (convenio.status === 'INACTIVO') {
        response.valido = false;
        response.msj = 'El convenio se encuentra inactivo';
        return response;
    }

    if (convenio.fecha_inicio && new Date(convenio.fecha_inicio) > hoy) {
        response.valido = false;
        response.msj = 'El convenio aún no comienza su vigencia';
        return response;
    }

    if (convenio.fecha_termino) {
        const termino = new Date(convenio.fecha_termino);
        termino.setHours(23, 59, 59, 999);
        if (hoy > termino) {
            response.valido = false;
            response.msj = 'El convenio ha expirado';
            return response;
        }
    }

    if (convenio.limitar_por_stock && convenio.tope_cantidad_tickets !== null) {
        const restantes = convenio.tope_cantidad_tickets - convenio.consumo_tickets;
        response.tickets_disponibles = restantes > 0 ? restantes : 0;

        if (restantes <= 0) {
            response.valido = false;
            response.msj = 'No queda disponibilidad de tickets para este convenio';
            return response;
        }
    }

    if (convenio.limitar_por_monto && convenio.tope_monto_descuento !== null) {
        const restanteMonto = convenio.tope_monto_descuento - convenio.consumo_monto_descuento;
        response.monto_disponible = restanteMonto > 0 ? Math.floor(restanteMonto) : 0;

        if (restanteMonto <= 0) {
            response.valido = false;
            response.msj = 'El convenio ha agotado su fondo monetario de descuentos';
            return response;
        }
    }

    return response;
};

/**
 * Desactivar convenios vencidos (Batch Job)
 */
exports.desactivarConveniosVencidos = async () => {
    const hoy = new Date();
    const result = { total: 0, details: [] };

    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const convenios = await Convenio.findAll({
        where: {
            status: 'ACTIVO',
            [Op.or]: [
                { fecha_inicio: { [Op.gt]: hoy } },
                { fecha_termino: { [Op.lt]: inicioHoy } }
            ]
        }
    });

    for (const convenio of convenios) {
        let reason = '';
        if (convenio.fecha_inicio && new Date(convenio.fecha_inicio) > hoy) reason = 'Futuro';

        if (convenio.fecha_termino) {
            const termino = new Date(convenio.fecha_termino);
            termino.setHours(23, 59, 59, 999);
            if (hoy > termino) reason = 'Vencido';
        }

        if (reason) {
            convenio.status = 'INACTIVO';
            await convenio.save();
            result.total++;
        }
    }
    return result;
};

/**
 * Listar convenios DISPONIBLES (Vigentes + Cupo + Monto)
 */
exports.listarDisponibles = async () => {
    const hoy = new Date();

    const convenios = await Convenio.findAll({
        where: {
            status: 'ACTIVO',
            fecha_inicio: { [Op.lte]: hoy },
            fecha_termino: { [Op.gte]: hoy },
            [Op.and]: [
                {
                    [Op.or]: [
                        { tope_monto_descuento: null },
                        {
                            [Op.and]: [
                                { tope_monto_descuento: { [Op.ne]: null } },
                                sequelize.where(sequelize.col('consumo_monto_descuento'), '<', sequelize.col('tope_monto_descuento'))
                            ]
                        }
                    ]
                },
                {
                    [Op.or]: [
                        { tope_cantidad_tickets: null },
                        {
                            [Op.and]: [
                                { tope_cantidad_tickets: { [Op.ne]: null } },
                                sequelize.where(sequelize.col('consumo_tickets'), '<', sequelize.col('tope_cantidad_tickets'))
                            ]
                        }
                    ]
                }
            ]
        },
        include: [{
            model: Empresa,
            as: 'empresa',
            attributes: ['id', 'nombre']
        }]
    });

    return convenios;
};

/**
 * Actualizar consumo de un convenio manualmente (acumulativo)
 */
exports.actualizarConsumo = async (id, { consumo_tickets, consumo_monto_descuento }) => {
    const convenio = await Convenio.findByPk(id);
    if (!convenio) {
        throw new NotFoundError('Convenio no encontrado');
    }

    const incrementData = {};
    if (consumo_tickets !== undefined && consumo_tickets !== null) {
        incrementData.consumo_tickets = consumo_tickets;
    }
    if (consumo_monto_descuento !== undefined && consumo_monto_descuento !== null) {
        incrementData.consumo_monto_descuento = consumo_monto_descuento;
    }

    if (Object.keys(incrementData).length > 0) {
        await convenio.increment(incrementData);
        await convenio.reload();
    }

    return convenio;
};

/**
 * Buscar convenios que contengan una ruta específica (Origen/Destino)
 */
exports.buscarConveniosPorRuta = async (origen_codigo, destino_codigo) => {
    const hoy = new Date();

    const convenios = await Convenio.findAll({
        where: {
            status: 'ACTIVO',
            tipo_alcance: 'Rutas Especificas',
            [Op.and]: [
                {
                    [Op.or]: [
                        { fecha_inicio: null },
                        { fecha_inicio: { [Op.lte]: hoy } }
                    ]
                },
                {
                    [Op.or]: [
                        { fecha_termino: null },
                        { fecha_termino: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } }
                    ]
                }
            ]
        },
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa'],
                where: { status: 'ACTIVO' }
            },
            {
                model: ApiConsulta,
                as: 'apiConsulta',
                attributes: ['id', 'nombre', 'endpoint']
            }
        ]
    });

    const conveniosFiltrados = convenios.filter(conv => {
        if (conv.rutas && Array.isArray(conv.rutas)) {
            return conv.rutas.some(r =>
                r.origen_codigo === origen_codigo &&
                r.destino_codigo === destino_codigo
            );
        }
        return false;
    });

    return conveniosFiltrados;
};

/**
 * Reemplaza o agrega rutas al campo JSON de un convenio.
 */
exports.agregarRutasAConvenio = async (convenioId, rutasData, configuracionesData = null) => {
    const convenio = await Convenio.findByPk(convenioId);
    if (!convenio) throw new NotFoundError('Convenio no encontrado');

    if (convenio.tipo_alcance !== 'Rutas Especificas') {
        throw new BusinessError('Este convenio es Global. Cambie el alcance a "Rutas Especificas" para añadir tramos.');
    }

    const rutasActuales = Array.isArray(convenio.rutas) ? convenio.rutas : [];

    const nuevasRutas = rutasData.map(r => ({
        origen_codigo: r.origen_codigo,
        origen_ciudad: r.origen_ciudad,
        destino_codigo: r.destino_codigo,
        destino_ciudad: r.destino_ciudad
    }));

    let rutasFinales = [...rutasActuales];
    nuevasRutas.forEach(nueva => {
        const index = rutasFinales.findIndex(r => 
            r.origen_codigo === nueva.origen_codigo && 
            r.destino_codigo === nueva.destino_codigo
        );

        if (index !== -1) {
            rutasFinales[index] = nueva;
        } else {
            rutasFinales.push(nueva);
        }
    });

    const updateData = { rutas: rutasFinales };
    if (configuracionesData) {
        updateData.configuraciones = configuracionesData;
    }

    await convenio.update(updateData);
    return {
        rutas: rutasFinales,
        configuraciones: updateData.configuraciones || convenio.configuraciones
    };
};

/**
 * Obtiene las rutas del campo JSON
 */
exports.obtenerRutasPorConvenio = async (convenioId) => {
    const convenio = await Convenio.findByPk(convenioId);
    return convenio ? (convenio.rutas || []) : [];
};

/**
 * Elimina una ruta del campo JSON comparando origen y destino
 */
exports.eliminarRutaDeConvenio = async (convenioId, origen_codigo, destino_codigo) => {
    const convenio = await Convenio.findByPk(convenioId);
    if (!convenio) throw new NotFoundError('Convenio no encontrado');

    if (!convenio.rutas || !Array.isArray(convenio.rutas)) {
        return true;
    }

    const rutasFiltradas = convenio.rutas.filter(r =>
        !(r.origen_codigo === origen_codigo && r.destino_codigo === destino_codigo)
    );

    await convenio.update({ rutas: rutasFiltradas });
    return true;
};
