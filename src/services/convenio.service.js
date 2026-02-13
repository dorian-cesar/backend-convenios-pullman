const { Convenio, Empresa, ApiConsulta, Evento, sequelize } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

/**
 * Crear convenio
 */
exports.crearConvenio = async ({ nombre, empresa_id, tipo, endpoint, api_consulta_id, tope_monto_ventas, tope_cantidad_tickets, porcentaje_descuento, codigo, limitar_por_stock, limitar_por_monto, fecha_inicio, fecha_termino }) => {
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

    const convenio = await Convenio.create({
        nombre,
        empresa_id,
        tipo: tipo || 'CODIGO_DESCUENTO',
        api_consulta_id: finalApiConsultaId,
        tope_monto_ventas,
        tope_cantidad_tickets,
        porcentaje_descuento: porcentaje_descuento || 0,
        codigo: finalCodigo,
        limitar_por_stock: limitar_por_stock || false,
        limitar_por_monto: limitar_por_monto || false,
        fecha_inicio,
        fecha_termino,
        status: 'ACTIVO'
    });

    return await Convenio.findByPk(convenio.id, {
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa']
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

    const sortField = sortBy || 'id';
    const sortOrder = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    const data = await Convenio.findAndCountAll({
        where,
        distinct: true, // Asegurar conteo de IDs únicos
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa']
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

    const data = await Convenio.findAndCountAll({
        where: { status: 'ACTIVO' },
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa'],
                required: true, // Debe tener empresa
                where: { status: 'ACTIVO' } // Opcional: ¿La empresa también debe estar activa? Asumo que sí por lógica de negocio.
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
                attributes: ['id', 'nombre', 'rut_empresa']
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
        limitar_por_stock, limitar_por_monto, fecha_inicio, fecha_termino,
        tipo, api_consulta_id, tope_monto_ventas, tope_cantidad_tickets
    } = datos;

    if (nombre) convenio.nombre = nombre;
    if (status) convenio.status = status;
    if (porcentaje_descuento !== undefined) convenio.porcentaje_descuento = porcentaje_descuento;
    if (codigo !== undefined) convenio.codigo = codigo;
    if (limitar_por_stock !== undefined) convenio.limitar_por_stock = limitar_por_stock;
    if (limitar_por_monto !== undefined) convenio.limitar_por_monto = limitar_por_monto;

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
    if (tope_monto_ventas !== undefined) convenio.tope_monto_ventas = tope_monto_ventas;
    if (tope_cantidad_tickets !== undefined) convenio.tope_cantidad_tickets = tope_cantidad_tickets;

    if (empresa_id) {
        const empresa = await Empresa.findByPk(empresa_id);
        if (!empresa) {
            throw new NotFoundError('Empresa no encontrada');
        }
        convenio.empresa_id = empresa_id;
    }

    await convenio.save();

    // Recargar con relaciones
    return await Convenio.findByPk(id, {
        include: [
            {
                model: Empresa,
                as: 'empresa',
                attributes: ['id', 'nombre', 'rut_empresa']
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

    // 1. Calcular Monto Acumulado Neto (Ventas + Cambios - Devoluciones)
    // Sumar montos pagados (COMPRA + CAMBIO)
    const totalVentasData = await Evento.findAll({
        attributes: [
            [sequelize.fn('SUM', sequelize.col('monto_pagado')), 'total']
        ],
        where: {
            convenio_id: convenioId,
            tipo_evento: ['COMPRA', 'CAMBIO'],
            is_deleted: false
        },
        raw: true
    });

    // Sumar devoluciones
    const totalDevolucionesData = await Evento.findAll({
        attributes: [
            [sequelize.fn('SUM', sequelize.col('monto_devolucion')), 'total']
        ],
        where: {
            convenio_id: convenioId,
            tipo_evento: 'DEVOLUCION',
            is_deleted: false
        },
        raw: true
    });

    const totalVentas = parseInt(totalVentasData[0].total || 0, 10);
    const totalDevoluciones = parseInt(totalDevolucionesData[0].total || 0, 10);
    const montoAcumuladoActual = totalVentas - totalDevoluciones;

    // 2. Calcular Cantidad de Tickets Neto (Compras - Devoluciones)
    const cantidadCompras = await Evento.count({
        where: {
            convenio_id: convenioId,
            tipo_evento: 'COMPRA',
            is_deleted: false
        }
    });

    const cantidadDevoluciones = await Evento.count({
        where: {
            convenio_id: convenioId,
            tipo_evento: 'DEVOLUCION',
            is_deleted: false
        }
    });

    const cantidadTicketsActual = cantidadCompras - cantidadDevoluciones;

    console.log(`[Convenio Check] ID: ${convenioId} | Monto: ${montoAcumuladoActual} + ${montoNuevo} vs Tope: ${convenio.tope_monto_ventas}`);
    console.log(`[Convenio Check] ID: ${convenioId} | Cantidad: ${cantidadTicketsActual} + 1 vs Tope: ${convenio.tope_cantidad_tickets}`);

    // 3. Verificaciones
    if (convenio.limitar_por_monto && convenio.tope_monto_ventas) {
        if ((montoAcumuladoActual + montoNuevo) > convenio.tope_monto_ventas) {
            throw new BusinessError(`El convenio ha alcanzado su límite de monto de ventas. Tope: $${convenio.tope_monto_ventas}, Actual: $${montoAcumuladoActual}, Intento: $${montoNuevo}`);
        }
    }

    if (convenio.limitar_por_stock && convenio.tope_cantidad_tickets) {
        // Asumimos que esta llamada es para agregar 1 ticket (una compra)
        if ((cantidadTicketsActual + 1) > convenio.tope_cantidad_tickets) {
            throw new BusinessError(`El convenio ha alcanzado su límite de cantidad de tickets. Tope: ${convenio.tope_cantidad_tickets}, Actual: ${cantidadTicketsActual}`);
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
        const hoy = new Date();

        if (hoy > fechaTermino) {
            convenio.status = 'INACTIVO';
            await convenio.save();

            return false;
        }
    }

    return true;
};
