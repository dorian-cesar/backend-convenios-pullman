const { Convenio, Empresa, ApiConsulta, ApiRegistro, Evento, sequelize } = require('../models');
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
    let finalPorcentajeDescuento = porcentaje_descuento || 0;

    // Si mandan porcentaje_descuento (Front viejo) pero no mandan el nuevo payload
    if (porcentaje_descuento !== undefined && valor_descuento === undefined) {
        finalValorDescuento = porcentaje_descuento;
        finalTipoDescuento = 'Porcentaje';
    } else if (finalTipoDescuento === 'Porcentaje' && finalValorDescuento !== undefined && finalValorDescuento !== null) {
        // Front nuevo envía "Porcentaje" y valor_descuento: guardamos en porcentaje_descuento por si la app legacy lee
        finalPorcentajeDescuento = Math.round(finalValorDescuento);
    }

    // Limpieza según el tipo de alcance
    if (tipo_alcance === 'Global') {
        rutas = null;
        configuraciones = null;
    }

    const convenio = await Convenio.create({
        nombre,
        empresa_id,
        tipo: tipo || 'CODIGO_DESCUENTO',
        api_consulta_id: finalApiConsultaId,
        tope_monto_descuento,
        tope_cantidad_tickets,
        porcentaje_descuento: finalPorcentajeDescuento,
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
            }
        ]
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
                    { fecha_termino: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } } // Comparar con inicio del día o fin?
                    // Si hoy es 18, y termino es 17 -> hoy > termino.
                    // Si termino es 18 -> hoy <= termino (si termino incluye hora 23:59:59).
                    // Para query segura: fecha_termino >= HOY (inicio dia)
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
                required: true, // Debe tener empresa
                where: { status: 'ACTIVO' }, // Opcional: ¿La empresa también debe estar activa? Asumo que sí por lógica de negocio.
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
            }
        ]
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

    // Lógica retrocompatibilidad (doble escritura)
    if (porcentaje_descuento !== undefined && valor_descuento === undefined) {
        // App o Admin Viejo
        convenio.valor_descuento = porcentaje_descuento;
        convenio.tipo_descuento = 'Porcentaje';
        convenio.porcentaje_descuento = porcentaje_descuento;
    } else if (convenio.tipo_descuento === 'Porcentaje') {
        // Front Nuevo envía tipo = Porcentaje y valor
        if (convenio.valor_descuento !== null) {
            convenio.porcentaje_descuento = Math.round(convenio.valor_descuento);
        }
    } else if (porcentaje_descuento !== undefined) {
        // Caso fallback explícito del front nuevo o request mixto
        convenio.porcentaje_descuento = porcentaje_descuento;
    }

    const finalTipo = tipo !== undefined ? tipo : convenio.tipo;
    if (finalTipo === 'API_EXTERNA' && codigo !== undefined && codigo !== null) {
        throw new BusinessError('El código debe ser null para convenios de tipo API_EXTERNA');
    }

    if (codigo !== undefined) convenio.codigo = finalTipo === 'API_EXTERNA' ? null : codigo;
    if (limitar_por_stock !== undefined) convenio.limitar_por_stock = limitar_por_stock;
    if (limitar_por_monto !== undefined) convenio.limitar_por_monto = limitar_por_monto;
    // Lógica de alcance
    const alcanceFinal = tipo_alcance !== undefined ? tipo_alcance : convenio.tipo_alcance;
    if (alcanceFinal === 'Global') {
        convenio.rutas = null;
        convenio.configuraciones = null;
    } else {
        if (rutas !== undefined) convenio.rutas = rutas;
        if (configuraciones !== undefined) convenio.configuraciones = configuraciones;
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

    // Aplicar lógica: Si fechas obligan INACTIVO, se setea INACTIVO.
    // Si fechas permiten ACTIVO, se respeta el status que venga en 'datos' o se mantiene el actual si no viene.
    // PERO si el usuario intenta poner ACTIVO explicitamente y las fechas no dan, ganan las fechas?
    // User requeriment: "tiene que en status estar inactivo si esta fuera de fechas" -> Ganan las fechas.

    if (forzarInactivo) {
        convenio.status = 'INACTIVO';
    } else {
        // Si fechas ok, revisamos si el usuario mandó status explícito
        if (status) {
            convenio.status = status;
        }
        // Si no mandó status, mantenemos el que tenía (salvo que antes fuera inactivo por fechas y ahora fechas ok? 
        // No auto-activamos salvo que lógica de negocio lo pida. Dejamos el que está).
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
            }
        ]
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
        // Validación estricta: Si ya excedió, o si con este nuevo excede.
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
        throw new BusinessError('El convenio aún no comienza su vigencia'); // Opcional: o NotFound para no dar pistas
    }
    if (convenio.fecha_termino) {
        const termino = new Date(convenio.fecha_termino);
        termino.setHours(23, 59, 59, 999);
        if (hoy > termino) {
            throw new BusinessError('El convenio ha expirado');
        }
    }

    // 2. Validar Monto (Si tiene tope y ya lo alcanzó o superó)
    if (convenio.tope_monto_descuento !== null && convenio.consumo_monto_descuento >= convenio.tope_monto_descuento) {
        throw new BusinessError('El convenio ha agotado su fondo de descuentos');
    }

    // 3. Validar Stock (Si tiene tope y ya lo alcanzó o superó)
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
        // Ajustar fecha de término al final del día (23:59:59) para incluir el día completo
        fechaTermino.setHours(23, 59, 59, 999);

        const hoy = new Date();

        if (hoy > fechaTermino) {
            convenio.status = 'INACTIVO';
            await convenio.save();

            return false;
        }
    }

    // Verificar fecha inicio (nuevo requerimiento)
    if (convenio.fecha_inicio) {
        const fechaInicio = new Date(convenio.fecha_inicio);
        const hoy = new Date();
        // Si hoy es ANTES de inicio, no está vigente
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
        tickets_disponibles: null, // null representa ilimitado
        monto_disponible: null,    // null representa ilimitado
        msj: "hay disponibilidad y el convenio está activo"
    };

    // 1. Validaciones absolutas de estado y fechas
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

    // 2. Cálculos de disponibilidad
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

    // Convertir hoy a inicio del día para comparación SQL simple
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const convenios = await Convenio.findAll({
        where: {
            status: 'ACTIVO',
            [Op.or]: [
                // Inicio futuro > hoy
                { fecha_inicio: { [Op.gt]: hoy } },
                // Termino pasado (ayer) -> fecha_termino < inicioHoy
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

    // Buscar convenios que cumplan todas las condiciones
    const convenios = await Convenio.findAll({
        where: {
            status: 'ACTIVO',
            // 1. Vigencia por fecha
            fecha_inicio: { [Op.lte]: hoy },
            fecha_termino: { [Op.gte]: hoy },
            // 2. Disponibilidad de Monto (Monto consumido < Tope OR Tope es NULL)
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
                // 3. Disponibilidad de Stock (Tickets consumidos < Tope OR Tope es NULL)
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
        // Volvemos a cargarlo tras el increment para retornar la data real actualizada
        await convenio.reload();
    }

    return convenio;
};

/**
 * Buscar convenios que contengan una ruta específica (Origen/Destino)
 */
exports.buscarConveniosPorRuta = async (origen_codigo, destino_codigo) => {
    const hoy = new Date();

    // 1. Buscar convenios activos de tipo Rutas Específicas
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

    // 2. Filtrar por el campo JSON rutas
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
 * Consolidado desde convenioRuta.service.js
 */
exports.agregarRutasAConvenio = async (convenioId, rutasData, configuracionesData = null) => {
    const convenio = await Convenio.findByPk(convenioId);
    if (!convenio) throw new NotFoundError('Convenio no encontrado');

    if (convenio.tipo_alcance !== 'Rutas Especificas') {
        throw new BusinessError('Este convenio es Global. Cambie el alcance a "Rutas Especificas" para añadir tramos.');
    }

    const rutasActuales = Array.isArray(convenio.rutas) ? convenio.rutas : [];

    // Normalizar nuevas rutas (Solo origen y destino, sin config interna ya que se rigen por la global)
    const nuevasRutas = rutasData.map(r => ({
        origen_codigo: r.origen_codigo,
        origen_ciudad: r.origen_ciudad,
        destino_codigo: r.destino_codigo,
        destino_ciudad: r.destino_ciudad
    }));

    // Combinar rutas
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
 * Consolidado desde convenioRuta.service.js
 */
exports.obtenerRutasPorConvenio = async (convenioId) => {
    const convenio = await Convenio.findByPk(convenioId);
    return convenio ? (convenio.rutas || []) : [];
};

/**
 * Elimina una ruta del campo JSON comparando origen y destino
 * Consolidado desde convenioRuta.service.js
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
