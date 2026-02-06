const { Descuento, Convenio, CodigoDescuento } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

/**
 * Crear descuento
 */
exports.crearDescuento = async (data) => {
    const { convenio_id, porcentaje_descuento } = data;

    if (!porcentaje_descuento) {
        throw new BusinessError('porcentaje_descuento es obligatorio');
    }

    if (porcentaje_descuento < 0 || porcentaje_descuento > 100) {
        throw new BusinessError('El porcentaje de descuento debe estar entre 0 y 100');
    }

    if (!convenio_id) {
        throw new BusinessError('Debe proporcionar convenio_id');
    }

    // Validar que el convenio exista
    const convenio = await Convenio.findByPk(convenio_id);
    if (!convenio) throw new NotFoundError('Convenio no encontrado');

    // Verificar que no exista ya un descuento para este convenio (solo se permite 1 activo)
    const activeDiscount = await Descuento.findOne({
        where: {
            convenio_id,
            status: 'ACTIVO'
        }
    });

    if (activeDiscount) {
        throw new BusinessError(`El convenio ya tiene un descuento activo (ID: ${activeDiscount.id}). Debe desactivarlo antes de crear uno nuevo.`);
    }

    const descuento = await Descuento.create({
        convenio_id,
        porcentaje_descuento,
        status: 'ACTIVO'
    });

    return await Descuento.findByPk(descuento.id, {
        include: [
            { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] }
        ]
    });
};

/**
 * Listar descuentos
 */
exports.listarDescuentos = async (filters = {}) => {
    const { page, limit, sortBy, order, status, ...otherFilters } = filters;
    const { offset, limit: limitVal } = getPagination(page, limit);
    const where = {};

    if (status || otherFilters.status) {
        where.status = status || otherFilters.status;
    }

    if (otherFilters.convenio_id) {
        where.convenio_id = otherFilters.convenio_id;
    }

    if (otherFilters.codigo_descuento_id) {
        where.codigo_descuento_id = otherFilters.codigo_descuento_id;
    }

    if (otherFilters.tipo_pasajero_id) {
        where.tipo_pasajero_id = otherFilters.tipo_pasajero_id;
    }

    const sortField = sortBy || 'id';
    const sortOrder = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    // Search Logic
    if (otherFilters.search) {
        const searchTerm = `%${otherFilters.search}%`;
        where[Op.or] = [
            { '$convenio.nombre$': { [Op.like]: searchTerm } },
            { '$CodigoDescuento.codigo$': { [Op.like]: searchTerm } }
        ];
    }

    const data = await Descuento.findAndCountAll({
        where,
        include: [
            { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] },
            { model: CodigoDescuento, attributes: ['id', 'codigo'] }
        ],
        order: [[sortField, sortOrder]],
        limit: limitVal,
        offset,
        subQuery: false // Required for referencing included columns in where clause
    });

    return getPagingData(data, page, limitVal);
};

/**
 * Obtener descuento por ID
 */
exports.obtenerDescuento = async (id) => {
    const descuento = await Descuento.findByPk(id, {
        include: [
            { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] },
            { model: CodigoDescuento, attributes: ['id', 'codigo'] }
        ]
    });

    if (!descuento) {
        throw new NotFoundError('Descuento no encontrado');
    }

    return descuento;
};

/**
 * Actualizar descuento
 */
exports.actualizarDescuento = async (id, datos) => {
    const descuento = await Descuento.findByPk(id);

    if (!descuento) {
        throw new NotFoundError('Descuento no encontrado');
    }

    const { porcentaje_descuento, status } = datos;

    if (porcentaje_descuento !== undefined) {
        if (porcentaje_descuento < 0 || porcentaje_descuento > 100) {
            throw new BusinessError('El porcentaje de descuento debe estar entre 0 y 100');
        }
        descuento.porcentaje_descuento = porcentaje_descuento;
    }

    if (status) {
        descuento.status = status;
    }

    await descuento.save();

    return await Descuento.findByPk(id, {
        include: [
            { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] },
            { model: CodigoDescuento, attributes: ['id', 'codigo'] }
        ]
    });
};

/**
 * Eliminar descuento (soft delete)
 */
exports.eliminarDescuento = async (id) => {
    const descuento = await Descuento.findByPk(id);

    if (!descuento) {
        throw new NotFoundError('Descuento no encontrado');
    }

    descuento.status = 'INACTIVO';
    await descuento.save();

    return descuento;
};

/**
 * Obtener descuento aplicable (lógica de negocio)
 */
exports.obtenerDescuentoAplicable = async ({
    convenioId,
    codigo,
    codigoDescuentoId,
    tipoPasajeroId,
    pasajeroId
}) => {
    // 1. Código de descuento (prioridad máxima)
    if (codigo || codigoDescuentoId) {
        const whereCodigo = {};
        if (codigo) whereCodigo.codigo = codigo;
        if (codigoDescuentoId) whereCodigo.id = codigoDescuentoId;

        const codigoValido = await CodigoDescuento.findOne({
            where: {
                ...whereCodigo,
                status: 'ACTIVO',
                fecha_inicio: { [Op.lte]: new Date() },
                fecha_termino: { [Op.gte]: new Date() }
            },
            include: [{
                model: Descuento,
                required: false
            }]
        });

        if (codigoValido && codigoValido.Descuentos && codigoValido.Descuentos.length > 0) {
            return codigoValido.Descuentos[0];
        }
    }

    // 2. Convenio General (Ahora es la única opción para convenio)
    if (convenioId) {
        const descuentoGeneral = await Descuento.findOne({
            where: {
                convenio_id: convenioId,
                status: 'ACTIVO'
            }
        });
        if (descuentoGeneral) return descuentoGeneral;
    }

    return null;
};
