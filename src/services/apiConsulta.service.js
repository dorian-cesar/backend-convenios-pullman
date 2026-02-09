const { ApiConsulta } = require('../models');
const NotFoundError = require('../exceptions/NotFoundError');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const { Op } = require('sequelize');

exports.crear = async (data) => {
    return await ApiConsulta.create(data);
};

exports.listar = async (params) => {
    const { page, limit, nombre, status, empresa_id, sortBy = 'id', order = 'ASC' } = params;
    const { limit: l, offset } = getPagination(page, limit);

    const where = {};
    if (nombre) where.nombre = nombre;
    if (status) where.status = status;
    if (empresa_id) where.empresa_id = empresa_id;

    const data = await ApiConsulta.findAndCountAll({
        where,
        limit: l,
        offset,
        order: [[sortBy, order.toUpperCase()]]
    });

    return getPagingData(data, page, l);
};

exports.obtenerPorId = async (id) => {
    const api = await ApiConsulta.findByPk(id);
    if (!api) throw new NotFoundError('API de consulta no encontrada');
    return api;
};

exports.actualizar = async (id, data) => {
    const api = await this.obtenerPorId(id);
    return await api.update(data);
};

exports.eliminar = async (id) => {
    const api = await this.obtenerPorId(id);
    await api.destroy();
    return true;
};
