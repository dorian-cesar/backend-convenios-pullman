const { Evento, Pasajero, Convenio, TipoPasajero, sequelize } = require('../models');
const { Op } = require('sequelize');

const getGranularitySQL = (granularidad, campoFecha = 'fecha_evento') => {
    switch (granularidad) {
        case 'diario':
            return {
                group: `DATE(${campoFecha}), HOUR(${campoFecha})`,
                select: `DATE_FORMAT(${campoFecha}, '%H:00')`
            };
        case 'semanal':
        case 'mensual':
            return {
                group: `DATE(${campoFecha})`,
                select: `DATE_FORMAT(${campoFecha}, '%d/%m')`
            };
        case 'trimestral':
        case 'semestral':
        case 'anual':
            return {
                group: `YEAR(${campoFecha}), MONTH(${campoFecha})`,
                select: `DATE_FORMAT(${campoFecha}, '%b %Y')`
            };
        case 'bienal':
        case 'trienal':
        case 'cuatrienal':
        case 'quinquenal':
            return {
                group: `YEAR(${campoFecha})`,
                select: `CAST(YEAR(${campoFecha}) AS CHAR)`
            };
        default:
            return {
                group: `YEAR(${campoFecha}), MONTH(${campoFecha})`,
                select: `DATE_FORMAT(${campoFecha}, '%Y-%m')`
            };
    }
};

const buildBaseWhere = (params) => {
    const { empresa_id, convenio_id, fecha_inicio, fecha_fin } = params;
    const where = {};

    if (empresa_id) {
        where.empresa_id = empresa_id;
    }

    if (convenio_id) {
        where.convenio_id = convenio_id;
    }

    if (fecha_inicio || fecha_fin) {
        where.createdAt = {};
        if (fecha_inicio) where.createdAt[Op.gte] = new Date(fecha_inicio);
        if (fecha_fin) where.createdAt[Op.lte] = new Date(`${fecha_fin}T23:59:59`);
    }

    return where;
};

exports.getResumenKpis = async (params) => {
    const { 
        granularidad = 'mensual',
        page = 1,
        limit = 1000
    } = params;

    const where = buildBaseWhere(params);
    // Usamos createdAt para máxima precisión nativa y evitar errores de formato
    const campoFechaSQL = "`createdAt`";
    const granSQL = getGranularitySQL(granularidad, campoFechaSQL);

    const attributes = [
        [sequelize.literal(granSQL.select), 'periodo'],
        [sequelize.fn('MIN', sequelize.col('createdAt')), 'fecha_ref'],
        // KPI 1: Total Ventas
        [sequelize.literal(`SUM(CASE WHEN \`tipo_evento\` = 'COMPRA' THEN \`monto_pagado\` ELSE 0 END)`), 'total_ventas'],
        // KPI 2: Total Devoluciones
        [sequelize.literal(`SUM(CASE WHEN \`tipo_evento\` = 'DEVOLUCION' THEN \`monto_devolucion\` ELSE 0 END)`), 'total_devoluciones'],
        // KPI 3: Total Descuentos (Usamos la columna directa monto_descuento)
        [sequelize.literal(`SUM(CASE WHEN \`tipo_evento\` = 'COMPRA' THEN COALESCE(\`monto_descuento\`, 0) ELSE 0 END)`), 'total_descuento'],
        // KPI 4: Total Pasajes (Conteo de cada ticket individual)
        [sequelize.literal(`COUNT(CASE WHEN \`tipo_evento\` = 'COMPRA' THEN 1 END)`), 'total_pasajeros']
    ];

    const offset = (page - 1) * limit;

    const data = await Evento.findAll({
        attributes,
        where,
        group: [sequelize.literal(granSQL.group)],
        order: [[sequelize.literal(granSQL.group), 'ASC']],
        limit: Number(limit),
        offset: Number(offset),
        raw: true
    });

    return {
        totalItems: data.length,
        totalPages: Math.ceil(data.length / limit),
        currentPage: Number(page),
        rows: data
    };
};

exports.getPorConvenio = async (params) => {
    const where = buildBaseWhere(params);

    return await Evento.findAll({
        attributes: [
            'convenio_id',
            [sequelize.literal('COALESCE(`Convenio`.`nombre`, \'Sin Convenio\')'), 'convenio_nombre'],
            [sequelize.literal('COUNT(CASE WHEN `tipo_evento` = \'COMPRA\' THEN 1 END)'), 'cantidad_pasajes'],
            [sequelize.literal('SUM(CASE WHEN `tipo_evento` = \'COMPRA\' THEN `tarifa_base` ELSE 0 END)'), 'total_sin_descuento'],
            [sequelize.literal('SUM(CASE WHEN `tipo_evento` = \'COMPRA\' THEN `monto_pagado` ELSE 0 END)'), 'total_ventas_reales']
        ],
        where,
        include: [{
            model: Convenio,
            attributes: [],
            required: false
        }],
        group: ['convenio_id', 'Convenio.nombre'],
        raw: true
    });
};

exports.getPorCodigo = async (params) => {
    const where = buildBaseWhere(params);
    // Asumiendo que existe una relación o campo codigo_descuento
    return await Evento.findAll({
        attributes: [
            'codigo_autorizacion',
            [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
            [sequelize.fn('SUM', sequelize.col('monto_pagado')), 'total']
        ],
        where,
        group: ['codigo_autorizacion'],
        raw: true
    });
};

exports.getPorTipoPasajero = async (params) => {
    const where = buildBaseWhere(params);
    return await Evento.findAll({
        attributes: [
            [sequelize.literal('COALESCE(`TipoPasajero`.`nombre`, \'General\')'), 'tipo'],
            [sequelize.fn('COUNT', sequelize.col('Evento.id')), 'cantidad']
        ],
        where,
        include: [{
            model: Pasajero,
            include: [{
                model: TipoPasajero,
                attributes: []
            }]
        }],
        group: ['TipoPasajero.nombre'],
        raw: true
    });
};
