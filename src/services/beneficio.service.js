const { Beneficio, Empresa, Convenio } = require('../models');
const { formatRut } = require('../utils/rut.utils');

exports.crear = async (data) => {
    if (data.rut) {
        data.rut = formatRut(data.rut);
    }
    return await Beneficio.create(data);
};

exports.obtenerPorRut = async (rut, convenio_id = null) => {
    const formattedRUT = formatRut(rut);
    const where = { rut: formattedRUT };
    if (convenio_id) {
        where.convenio_id = convenio_id;
    }
    return await Beneficio.findOne({ 
        where,
        include: [
            { model: Convenio, as: 'convenio' }
        ]
    });
};

exports.obtenerPorId = async (id) => {
    return await Beneficio.findByPk(id, {
        include: [
            { model: Empresa, as: 'empresa' },
            { model: Convenio, as: 'convenio' }
        ]
    });
};

exports.listar = async (query = {}) => {
    const { limit = 10, page = 1, tipo_beneficio, status, rut } = query;
    const offset = (page - 1) * limit;
    const where = {};

    if (tipo_beneficio) where.tipo_beneficio = tipo_beneficio;
    if (status) where.status = status;
    if (rut) where.rut = formatRut(rut);

    const { count, rows } = await Beneficio.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
            { model: Empresa, as: 'empresa' },
            { model: Convenio, as: 'convenio' }
        ]
    });

    return {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        data: rows
    };
};

exports.actualizar = async (id, data) => {
    const beneficio = await Beneficio.findByPk(id);
    if (!beneficio) return null;
    return await beneficio.update(data);
};

exports.eliminar = async (id) => {
    const beneficio = await Beneficio.findByPk(id);
    if (!beneficio) return null;
    await beneficio.destroy();
    return true;
};

exports.activar = async (id) => {
    const beneficio = await Beneficio.findByPk(id);
    if (!beneficio) return null;
    return await beneficio.update({ status: 'ACTIVO' });
};
