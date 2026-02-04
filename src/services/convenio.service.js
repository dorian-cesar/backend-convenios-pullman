const { Convenio, Empresa, Descuento, ApiConsulta, Evento, sequelize } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

/**
 * Crear convenio
 */
exports.crearConvenio = async ({ nombre, empresa_id, tipo, endpoint, tope_monto_ventas, tope_cantidad_tickets }) => {
    if (!nombre || !empresa_id) {
        throw new BusinessError('Nombre y empresa_id son obligatorios');
    }

    // Verificar que la empresa existe
    const empresa = await Empresa.findByPk(empresa_id);
    if (!empresa) {
        throw new NotFoundError('Empresa no encontrada');
    }

    let apiConsultaId = null;

    // Lógica para asignar/crear ApiConsulta según el tipo
    if (tipo === 'CODIGO_DESCUENTO') {
        // Para código de descuento, NO usamos referencia a tabla externa (ApiConsulta).
        // El endpoint se construye dinámicamente en el DTO usando la variable de entorno.
        apiConsultaId = null;
    } else if (tipo === 'API_EXTERNA') {
        if (!endpoint) {
            throw new BusinessError('Para API_EXTERNA se requiere un endpoint');
        }
        // Buscar si ya existe esa API o crearla
        const [api] = await ApiConsulta.findOrCreate({
            where: { endpoint: endpoint },
            defaults: { nombre: `API ${nombre}`, status: 'ACTIVO' }
        });
        apiConsultaId = api.id;
    }

    const convenio = await Convenio.create({
        nombre,
        empresa_id,
        tipo: tipo || 'CODIGO_DESCUENTO',
        api_consulta_id: apiConsultaId,
        tope_monto_ventas,
        tope_cantidad_tickets,
        status: 'ACTIVO'
    });

    // Recargar para obtener la asociación de ApiConsulta
    await convenio.reload({
        include: [{
            model: ApiConsulta,
            as: 'apiConsulta'
        }]
    });

    return convenio;
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
            },

        ],
        order: [[sortField, sortOrder]],
        limit: limitVal,
        offset
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
            },
            {
                model: Descuento,
                as: 'descuentos'
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

    const { nombre, status, empresa_id } = datos;

    if (nombre) convenio.nombre = nombre;
    if (status) convenio.status = status;

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
            },
            {
                model: Descuento
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

    // Si no tienes topes definidos, pase
    if (!convenio.tope_monto_ventas && !convenio.tope_cantidad_tickets) {
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
    if (convenio.tope_monto_ventas) {
        if ((montoAcumuladoActual + montoNuevo) > convenio.tope_monto_ventas) {
            throw new BusinessError(`El convenio ha alcanzado su límite de monto de ventas. Tope: $${convenio.tope_monto_ventas}, Actual: $${montoAcumuladoActual}, Intento: $${montoNuevo}`);
        }
    }

    if (convenio.tope_cantidad_tickets) {
        // Asumimos que esta llamada es para agregar 1 ticket (una compra)
        if ((cantidadTicketsActual + 1) > convenio.tope_cantidad_tickets) {
            throw new BusinessError(`El convenio ha alcanzado su límite de cantidad de tickets. Tope: ${convenio.tope_cantidad_tickets}, Actual: ${cantidadTicketsActual}`);
        }
    }

    return true;
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
        // Normalizar horas para comparar solo fechas si es necesario, 
        // pero date vs date funciona bien para expiración exacta.

        if (hoy > fechaTermino) {
            convenio.status = 'INACTIVO';
            await convenio.save();
            return false;
        }
    }

    return true;
};
