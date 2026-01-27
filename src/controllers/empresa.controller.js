const { Empresa } = require('../models');
const BusinessError = require('../exceptions/BusinessError');

exports.crear = async (req, res, next) => {
  try {
    const { nombre, rut } = req.body;

    if (!nombre || !rut) {
      throw new BusinessError('Nombre y RUT son obligatorios');
    }

    const existe = await Empresa.findOne({ where: { rut } });
    if (existe) {
      throw new BusinessError('Empresa ya registrada');
    }

    const empresa = await Empresa.create({ nombre, rut });

    res.status(201).json(empresa);
  } catch (error) {
    next(error);
  }
};

exports.listar = async (_req, res, next) => {
  try {
    const empresas = await Empresa.findAll();
    res.json(empresas);
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

    await empresa.update(req.body);
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
