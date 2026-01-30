const { Evento, Pasajero, Convenio, CodigoDescuento, TipoPasajero, sequelize } = require('../models');
const { Op } = require('sequelize');
const BusinessError = require('../exceptions/BusinessError');

/**
 * KPI Service
 * Handles aggregation of Event data for KPIs.
 */

// Helper to get SQL grouping logic based on granularity
const getGranularitySQL = (granularidad, campoFecha = 'fecha_evento') => {
    switch (granularidad) {
        case 'diario':
            return {
                group: `DATE(${campoFecha})`,
                select: `DATE(${campoFecha})`
            };
        case 'semanal':
            // Format: 2026-W05
            return {
                group: `YEAR(${campoFecha}), WEEK(${campoFecha}, 1)`,
                select: `CONCAT(YEAR(${campoFecha}), '-W', LPAD(WEEK(${campoFecha}, 1), 2, '0'))`
            };
        case 'mensual':
            // Format: 2026-01
            return {
                group: `YEAR(${campoFecha}), MONTH(${campoFecha})`,
                select: `DATE_FORMAT(${campoFecha}, '%Y-%m')`
            };
        case 'trimestral':
            // Format: 2026-Q1
            return {
                group: `YEAR(${campoFecha}), QUARTER(${campoFecha})`,
                select: `CONCAT(YEAR(${campoFecha}), '-Q', QUARTER(${campoFecha}))`
            };
        case 'semestral':
            // Format: 2026-S1
            return {
                group: `YEAR(${campoFecha}), IF(MONTH(${campoFecha}) <= 6, 1, 2)`,
                select: `CONCAT(YEAR(${campoFecha}), '-S', IF(MONTH(${campoFecha}) <= 6, 1, 2))`
            };
        case 'anual':
            // Format: 2026
            return {
                group: `YEAR(${campoFecha})`,
                select: `CAST(YEAR(${campoFecha}) AS CHAR)`
            };
        case 'quinquenal':
            // Format: 2025-2029
            // Logic: FLOOR(YEAR / 5) * 5
            return {
                group: `FLOOR(YEAR(${campoFecha}) / 5)`,
                select: `CONCAT(FLOOR(YEAR(${campoFecha}) / 5) * 5, '-', (FLOOR(YEAR(${campoFecha}) / 5) * 5) + 4)`
            };
        default:
            // Default to monthly if invalid or unspecified
            return {
                group: `YEAR(${campoFecha}), MONTH(${campoFecha})`,
                select: `DATE_FORMAT(${campoFecha}, '%Y-%m')`
            };
    }
};

const buildBaseWhere = (filters) => {
    const { empresa_id, fecha_inicio, fecha_fin } = filters;
    const where = {
        is_deleted: false
    };

    if (empresa_id) {
        where.empresa_id = empresa_id;
    }

    if (fecha_inicio || fecha_fin) {
        where.fecha_evento = {};
        if (fecha_inicio) where.fecha_evento[Op.gte] = new Date(fecha_inicio);
        if (fecha_fin) where.fecha_evento[Op.lte] = new Date(fecha_fin + 'T23:59:59');
    }
    return where;
};

exports.getResumenKpis = async (params) => {
    const {
        granularidad = 'mensual',
        page = 1,
        limit = 12,
        sortBy = 'periodo',
        order = 'ASC'
    } = params;

    const where = buildBaseWhere(params);
    const granSQL = getGranularitySQL(granularidad, 'fecha_evento');

    const attributes = [
        [sequelize.literal(granSQL.select), 'periodo'],
        // KPI 1: Total Ventas
        [sequelize.literal(`SUM(CASE WHEN tipo_evento = 'COMPRA' THEN monto_pagado ELSE 0 END)`), 'total_ventas'],
        // KPI 2: Total Devoluciones
        [sequelize.literal(`SUM(CASE WHEN tipo_evento = 'DEVOLUCION' THEN monto_devolucion ELSE 0 END)`), 'total_devoluciones'],
        // KPI 3: Total Descuentos
        [sequelize.literal(`SUM(CASE WHEN tipo_evento = 'COMPRA' THEN (tarifa_base * (COALESCE(porcentaje_descuento_aplicado, 0) / 100)) ELSE 0 END)`), 'total_descuento'],
        // KPI 4: Total Pasajeros
        [sequelize.literal(`COUNT(DISTINCT CASE WHEN tipo_evento = 'COMPRA' THEN pasajero_id END)`), 'total_pasajeros']
    ];

    const offset = (page - 1) * limit;

    const rows = await Evento.findAll({
        attributes: attributes,
        where: where,
        group: [sequelize.literal(granSQL.group)],
        order: [[sequelize.literal(sortBy === 'periodo' ? 'periodo' : sortBy), order.toUpperCase()]],
        offset: parseInt(offset),
        limit: parseInt(limit),
        raw: true
    });

    const countQuery = await Evento.findAll({
        attributes: [[sequelize.literal(granSQL.select), 'periodo']],
        where: where,
        group: [sequelize.literal(granSQL.group)],
        raw: true
    });

    const totalItems = countQuery.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        totalItems,
        totalPages,
        currentPage: parseInt(page),
        rows
    };
};

/**
 * KPI: Pasajes por Convenio
 */
exports.getPorConvenio = async (params) => {
    const where = buildBaseWhere(params);
    where.tipo_evento = 'COMPRA'; // Solo compras cuentan para volumen de convenios

    const rows = await Evento.findAll({
        attributes: [
            'convenio_id',
            [sequelize.col('Convenio.nombre'), 'convenio_nombre'],
            [sequelize.fn('COUNT', sequelize.col('Evento.id')), 'cantidad_pasajes'],
            [sequelize.fn('SUM', sequelize.col('monto_pagado')), 'total_monto']
        ],
        include: [{
            model: Convenio,
            attributes: [],
            required: false
        }],
        where: where,
        group: ['convenio_id', 'Convenio.nombre'],
        order: [[sequelize.literal('cantidad_pasajes'), 'DESC']],
        raw: true
    });

    return rows;
};

/**
 * KPI: Pasajes por Código de Descuento
 */
exports.getPorCodigo = async (params) => {
    const where = buildBaseWhere(params);
    where.tipo_evento = 'COMPRA';
    where.codigo_descuento_id = { [Op.ne]: null }; // Solo si hay código

    const rows = await Evento.findAll({
        attributes: [
            'codigo_descuento_id',
            [sequelize.col('CodigoDescuento.codigo'), 'codigo_nombre'],
            [sequelize.fn('COUNT', sequelize.col('Evento.id')), 'cantidad_pasajes'],
            [sequelize.fn('SUM', sequelize.col('monto_pagado')), 'total_monto']
        ],
        include: [{
            model: CodigoDescuento,
            attributes: [],
            required: true
        }],
        where: where,
        group: ['codigo_descuento_id', 'CodigoDescuento.codigo'],
        order: [[sequelize.literal('cantidad_pasajes'), 'DESC']],
        raw: true
    });

    return rows;
};

/**
 * KPI: Pasajes por Tipo de Pasajero (Requiere Join con Pasajero y TipoPasajero)
 */
exports.getPorTipoPasajero = async (params) => {
    const where = buildBaseWhere(params);
    where.tipo_evento = 'COMPRA';

    const rows = await Evento.findAll({
        attributes: [
            [sequelize.col('Pasajero.tipo_pasajero_id'), 'tipo_pasajero_id'],
            [sequelize.col('Pasajero.TipoPasajero.nombre'), 'tipo_pasajero_nombre'],
            [sequelize.fn('COUNT', sequelize.col('Evento.id')), 'cantidad_pasajes'],
            [sequelize.fn('SUM', sequelize.col('monto_pagado')), 'total_monto']
        ],
        include: [{
            model: Pasajero,
            attributes: [],
            required: true,
            include: [{
                model: TipoPasajero,
                attributes: [],
                required: false
            }]
        }],
        where: where,
        group: ['Pasajero.tipo_pasajero_id', 'Pasajero.TipoPasajero.nombre'],
        order: [[sequelize.literal('cantidad_pasajes'), 'DESC']],
        raw: true
    });

    return rows;
};
