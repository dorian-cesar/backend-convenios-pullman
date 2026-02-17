const { PasajeroFrecuente } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const { formatRut } = require('../utils/rut.utils');
const { Op } = require('sequelize');

exports.crear = async (data) => {
    return await PasajeroFrecuente.create(data);
};

exports.obtenerPorRut = async (rut) => {
    return await PasajeroFrecuente.findOne({ where: { rut: formatRut(rut) } });
};

exports.listar = async (filters = {}) => {
    const { page, limit, nombre, rut, status } = filters;
    const { offset, limit: limitVal } = getPagination(page, limit);
    const where = {};

    if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
    if (rut) where.rut = formatRut(rut);
    if (status) where.status = status;


    const data = await PasajeroFrecuente.findAndCountAll({
        where,
        attributes: { exclude: ['imagen_base64'] },
        limit: limitVal,
        offset,
        order: [['id', 'DESC']]
    });

    return getPagingData(data, page, limitVal);
};

exports.obtenerPorId = async (id) => {
    return await PasajeroFrecuente.findByPk(id);
};

exports.actualizar = async (id, data) => {
    const frecuente = await PasajeroFrecuente.findByPk(id);
    if (!frecuente) return null;
    return await frecuente.update(data);
};

exports.eliminar = async (id) => {
    const frecuente = await PasajeroFrecuente.findByPk(id);
    if (!frecuente) return false;
    await frecuente.destroy();
    return true;
};

exports.activar = async (id) => {
    const frecuente = await PasajeroFrecuente.findByPk(id);
    if (!frecuente) return null;
    return await frecuente.update({ status: 'ACTIVO' });
};
