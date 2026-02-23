const { AdultoMayor } = require('../models');
const emailService = require('./email.service');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const { formatRut } = require('../utils/rut.utils');
const { Op } = require('sequelize');

exports.crear = async (data) => {
    return await AdultoMayor.create(data);
};

exports.obtenerPorRut = async (rut) => {
    return await AdultoMayor.findOne({ where: { rut: formatRut(rut) } });
};

exports.listar = async (filters = {}) => {
    const { page, limit, nombre, rut, status } = filters;
    const { offset, limit: limitVal } = getPagination(page, limit);
    const where = {};

    if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
    if (rut) where.rut = formatRut(rut);
    if (status) where.status = status;

    const data = await AdultoMayor.findAndCountAll({
        where,
        attributes: { exclude: ['imagen_cedula_identidad', 'imagen_certificado_residencia'] },
        limit: limitVal,
        offset,
        order: [['id', 'DESC']]
    });

    return getPagingData(data, page, limitVal);
};

exports.obtenerPorId = async (id) => {
    return await AdultoMayor.findByPk(id);
};

exports.actualizar = async (id, data) => {
    const adulto = await AdultoMayor.findByPk(id);
    if (!adulto) return null;

    // Si se está cambiando el estado a RECHAZADO y se proporciona una razón
    if (data.status === 'RECHAZADO' && data.razon_rechazo && data.razon_rechazo !== adulto.razon_rechazo) {
        emailService.enviarCorreoRechazo(adulto.correo, adulto.nombre, data.razon_rechazo, 'Adulto Mayor').catch(console.error);
    }

    return await adulto.update(data);
};

exports.eliminar = async (id) => {
    const adulto = await AdultoMayor.findByPk(id);
    if (!adulto) return false;
    await adulto.destroy();
    return true;
};

exports.activar = async (id) => {
    const adulto = await AdultoMayor.findByPk(id);
    if (!adulto) return null;
    return await adulto.update({ status: 'ACTIVO' });
};
