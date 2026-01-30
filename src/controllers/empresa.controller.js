const { Empresa } = require('../models');
const { Op } = require('sequelize');
const BusinessError = require('../exceptions/BusinessError');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

exports.crear = async (req, res, next) => {
  try {
    const { nombre, rut } = req.body;

    if (!nombre || !rut) {
      throw new BusinessError('Nombre y RUT son obligatorios');
    }

    // Map rut from API to rut_empresa in DB
    const existe = await Empresa.findOne({ where: { rut_empresa: rut } });
    if (existe) {
      throw new BusinessError('Empresa ya registrada');
    }

    const empresa = await Empresa.create({ nombre, rut_empresa: rut });

    res.status(201).json(empresa);
  } catch (error) {
    next(error);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const { page, limit, sortBy, order, status, nombre } = req.query;
    const { offset, limit: limitVal } = getPagination(page, limit);

    const where = {};
    if (status) {
      where.status = status;
    }
    if (nombre) {
      where.nombre = { [Op.like]: `%${nombre}%` };
    }

    const sortField = sortBy || 'createdAt';
    const sortOrder = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    const data = await Empresa.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit: limitVal,
      offset
    });

    res.json(getPagingData(data, page, limitVal));
  } catch (error) {
    next(error);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) {
      throw new BusinessError('Empresa no encontrada');
    }
    res.json(empresa);
  } catch (error) {
    next(error);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) {
      throw new BusinessError('Empresa no encontrada');
    }

    const { nombre, rut, status } = req.body;
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (rut) updateData.rut_empresa = rut;
    if (status) updateData.status = status;

    await empresa.update(updateData);
    res.json(empresa);
  } catch (error) {
    next(error);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) {
      throw new BusinessError('Empresa no encontrada');
    }

    await empresa.update({ status: 'INACTIVA' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
