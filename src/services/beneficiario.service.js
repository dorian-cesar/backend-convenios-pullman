const { Beneficiario, Empresa, Convenio } = require('../models');
const { formatRut } = require('../utils/rut.utils');

exports.crear = async (data) => {
    if (data.rut) {
        data.rut = formatRut(data.rut);
    }
    return await Beneficiario.create(data);
};

exports.obtenerPorRut = async (rut, convenio_id = null) => {
    const formattedRUT = formatRut(rut);
    const where = { rut: formattedRUT };
    if (convenio_id) {
        where.convenio_id = convenio_id;
    }
    return await Beneficiario.findOne({ 
        where,
        include: [
            { model: Convenio, as: 'convenio' }
        ]
    });
};

exports.obtenerPorId = async (id) => {
    return await Beneficiario.findByPk(id, {
        include: [
            { model: Convenio, as: 'convenio' }
        ]
    });
};

exports.listar = async (query = {}) => {
    const { limit = 10, page = 1, convenio_id, status, rut } = query;
    const offset = (page - 1) * limit;
    const where = {};

    if (convenio_id) where.convenio_id = convenio_id;
    if (status) where.status = status;
    if (rut) where.rut = formatRut(rut);

    const { count, rows } = await Beneficiario.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
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
    const beneficiario = await Beneficiario.findByPk(id);
    if (!beneficiario) return null;
    return await beneficiario.update(data);
};

exports.eliminar = async (id) => {
    const beneficiario = await Beneficiario.findByPk(id);
    if (!beneficiario) return null;
    await beneficiario.destroy();
    return true;
};

exports.activar = async (id) => {
    const beneficiario = await Beneficiario.findByPk(id);
    if (!beneficiario) return null;
    return await beneficiario.update({ status: 'ACTIVO' });
};
