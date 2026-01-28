const { CodigoDescuento, Convenio } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const { Op } = require('sequelize');

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
        include: [{ model: Convenio, attributes: ['id', 'nombre'] }]
    });
};

/**
 * Listar códigos de descuento
 */
exports.listarCodigosDescuento = async (filters = {}) => {
    const where = {};

    if (filters.convenio_id) {
        where.convenio_id = filters.convenio_id;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    // Filtrar solo vigentes
    if (filters.vigentes === 'true') {
        const hoy = new Date();
        where.status = 'ACTIVO';
        where.fecha_inicio = { [Op.lte]: hoy };
        where.fecha_termino = { [Op.gte]: hoy };
    }

    const codigos = await CodigoDescuento.findAll({
        where,
        include: [{ model: Convenio, attributes: ['id', 'nombre'] }],
        order: [['created_at', 'DESC']]
    });

    return codigos;
};

/**
 * Obtener código de descuento por ID
 */
exports.obtenerCodigoDescuento = async (id) => {
    const codigo = await CodigoDescuento.findByPk(id, {
        include: [{ model: Convenio, attributes: ['id', 'nombre'] }]
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
        include: [{ model: Convenio, attributes: ['id', 'nombre'] }]
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
        include: [{ model: Convenio, attributes: ['id', 'nombre'] }]
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
        include: [{ model: Convenio, attributes: ['id', 'nombre'] }]
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
