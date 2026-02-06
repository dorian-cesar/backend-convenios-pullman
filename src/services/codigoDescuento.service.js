const { CodigoDescuento, Convenio, Descuento, Empresa } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

/**
 * Crear código de descuento
 */
exports.crearCodigoDescuento = async (data) => {
    const { convenio_id, codigo, fecha_inicio, fecha_termino, max_usos } = data;

    if (!convenio_id || !codigo || !fecha_inicio || !fecha_termino) {
        throw new BusinessError('convenio_id, codigo, fecha_inicio y fecha_termino son obligatorios');
    }

    // Verificar que el convenio existe
    const convenio = await Convenio.findByPk(convenio_id);
    if (!convenio) {
        throw new NotFoundError('Convenio no encontrado');
    }

    // Verificar que el código no existe ya
    const existe = await CodigoDescuento.findOne({ where: { codigo } });
    if (existe) {
        throw new BusinessError('Ya existe un código de descuento con ese código');
    }

    // Validar fechas
    if (new Date(fecha_inicio) > new Date(fecha_termino)) {
        throw new BusinessError('La fecha de inicio no puede ser posterior a la fecha de término');
    }

    const codigoDescuento = await CodigoDescuento.create({
        convenio_id,
        codigo,
        fecha_inicio,
        fecha_termino,
        max_usos,
        usos_realizados: 0,
        status: 'ACTIVO'
    });

    return await CodigoDescuento.findByPk(codigoDescuento.id, {
        include: [
            { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] },
            { model: Descuento, as: 'descuentos' }
        ]
    });
};

/**
 * Listar códigos de descuento
 */
exports.listarCodigosDescuento = async (filters = {}) => {
    const { page, limit, sortBy, order, status, ...otherFilters } = filters;
    const { offset, limit: limitVal } = getPagination(page, limit);
    const where = {};

    if (status || otherFilters.status) {
        where.status = status || otherFilters.status;
    }

    if (otherFilters.convenio_id) {
        where.convenio_id = otherFilters.convenio_id;
    }

    // Filtrar solo vigentes
    if (otherFilters.vigentes === 'true') {
        const hoy = new Date();
        where.status = 'ACTIVO';
        where.fecha_inicio = { [Op.lte]: hoy };
        where.fecha_termino = { [Op.gte]: hoy };
    }

    const sortField = sortBy || 'created_at';
    const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    const data = await CodigoDescuento.findAndCountAll({
        where,
        include: [
            {
                model: Convenio, as: 'convenio', attributes: ['id', 'nombre', 'empresa_id'],
                include: [{ model: Empresa, as: 'empresa', attributes: ['id', 'nombre'] }]
            },
            { model: Descuento, as: 'descuentos' }
        ],
        order: [[sortField, sortOrder]],
        limit: limitVal,
        offset
    });

    return getPagingData(data, page, limitVal);
};

/**
 * Obtener código de descuento por ID
 */
exports.obtenerCodigoDescuento = async (id) => {
    const codigo = await CodigoDescuento.findByPk(id, {
        include: [
            { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] },
            { model: Descuento, as: 'descuentos' }
        ]
    });

    if (!codigo) {
        throw new NotFoundError('Código de descuento no encontrado');
    }

    return codigo;
};

/**
 * Buscar código de descuento por código
 */
exports.buscarPorCodigo = async (codigo) => {
    const codigoDescuento = await CodigoDescuento.findOne({
        where: { codigo },
        include: [
            {
                model: Convenio,
                as: 'convenio',
                attributes: ['id', 'nombre', 'empresa_id'],
                include: [
                    { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'rut_empresa'] }
                ]
            },
            { model: Descuento, as: 'descuentos' }
        ]
    });

    if (!codigoDescuento) {
        throw new NotFoundError('Código de descuento no encontrado');
    }

    return codigoDescuento;
};

/**
 * Validar y usar código de descuento
 */
exports.validarYUsarCodigo = async (codigo) => {
    const codigoDescuento = await CodigoDescuento.findOne({
        where: { codigo }
    });

    if (!codigoDescuento) {
        throw new NotFoundError('Código de descuento no encontrado');
    }

    // Validar estado
    if (codigoDescuento.status !== 'ACTIVO') {
        throw new BusinessError('El código de descuento no está activo');
    }

    // Validar fechas
    const hoy = new Date();
    const inicio = new Date(codigoDescuento.fecha_inicio);
    const termino = new Date(codigoDescuento.fecha_termino);

    if (hoy < inicio) {
        throw new BusinessError('El código de descuento aún no está vigente');
    }

    if (hoy > termino) {
        throw new BusinessError('El código de descuento ha expirado');
    }

    // Validar usos
    if (codigoDescuento.max_usos !== null && codigoDescuento.usos_realizados >= codigoDescuento.max_usos) {
        throw new BusinessError('El código de descuento ha alcanzado el máximo de usos');
    }

    // Incrementar usos
    codigoDescuento.usos_realizados += 1;
    await codigoDescuento.save();

    return await CodigoDescuento.findByPk(codigoDescuento.id, {
        include: [
            { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] },
            { model: Descuento, as: 'descuentos' }
        ]
    });
};

/**
 * Actualizar código de descuento
 */
exports.actualizarCodigoDescuento = async (id, datos) => {
    const codigo = await CodigoDescuento.findByPk(id);

    if (!codigo) {
        throw new NotFoundError('Código de descuento no encontrado');
    }

    const { fecha_inicio, fecha_termino, max_usos, status } = datos;

    if (fecha_inicio) codigo.fecha_inicio = fecha_inicio;
    if (fecha_termino) codigo.fecha_termino = fecha_termino;
    if (max_usos !== undefined) codigo.max_usos = max_usos;
    if (status) codigo.status = status;

    // Validar fechas si se actualizan
    if (fecha_inicio || fecha_termino) {
        const inicio = new Date(codigo.fecha_inicio);
        const termino = new Date(codigo.fecha_termino);

        if (inicio > termino) {
            throw new BusinessError('La fecha de inicio no puede ser posterior a la fecha de término');
        }
    }

    await codigo.save();

    return await CodigoDescuento.findByPk(id, {
        include: [
            { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] },
            { model: Descuento, as: 'descuentos' }
        ]
    });
};

/**
 * Eliminar código de descuento (soft delete)
 */
exports.eliminarCodigoDescuento = async (id) => {
    const codigo = await CodigoDescuento.findByPk(id);

    if (!codigo) {
        throw new NotFoundError('Código de descuento no encontrado');
    }

    codigo.status = 'INACTIVO';
    await codigo.save();

    return codigo;
};
