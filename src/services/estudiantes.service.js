const { Estudiante } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const { Op } = require('sequelize');

exports.crear = async (data) => {
    return await Estudiante.create(data);
};

exports.obtenerPorRut = async (rut) => {
    return await Estudiante.findOne({ where: { rut } });
};

exports.listar = async (filters = {}) => {
    const { page, limit, nombre, rut, status } = filters;
    const { offset, limit: limitVal } = getPagination(page, limit);
    const where = {};

    if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
    if (rut) where.rut = rut;
    if (status) where.status = status;

    const data = await Estudiante.findAndCountAll({
        where,
        attributes: { exclude: ['imagen_base64'] },
        limit: limitVal,
        offset,
        order: [['id', 'DESC']]
    });

    return getPagingData(data, page, limitVal);
};

exports.obtenerPorId = async (id) => {
    return await Estudiante.findByPk(id);
};

exports.actualizar = async (id, data) => {
    const estudiante = await Estudiante.findByPk(id);
    if (!estudiante) return null;
    return await estudiante.update(data);
};

exports.eliminar = async (id) => {
    const estudiante = await Estudiante.findByPk(id);
    if (!estudiante) return false;
    await estudiante.destroy();
    return true;
};

exports.activar = async (id) => {
    const estudiante = await Estudiante.findByPk(id);
    if (!estudiante) return null;
    return await estudiante.update({ status: 'ACTIVO' });
};
