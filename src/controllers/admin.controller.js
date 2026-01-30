const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const UsuarioDTO = require('../dtos/usuario.dto');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

exports.crearUsuario = async (req, res, next) => {
  try {
    const { correo, password, rol, rol_id } = req.body;

    if (!correo || !password) {
      throw new BusinessError('Correo y password son requeridos');
    }

    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      throw new BusinessError('Correo ya registrado');
    }

    let rolRecord = null;
    if (rol_id) {
      rolRecord = await Rol.findOne({ where: { id: rol_id, status: 'ACTIVO' } });
    } else if (rol) {
      rolRecord = await Rol.findOne({ where: { nombre: rol.toUpperCase(), status: 'ACTIVO' } });
    } else {
      // By default, admin API creates ordinary users
      rolRecord = await Rol.findOne({ where: { nombre: 'USUARIO', status: 'ACTIVO' } });
    }

    if (!rolRecord) {
      throw new BusinessError('Rol inválido o inactivo');
    }

    const hash = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      correo,
      password_hash: hash
    });

    await usuario.addRol(rolRecord, { through: { status: 'ACTIVO' } });

    res.status(201).json({
      id: usuario.id,
      correo: usuario.correo,
      rol: rolRecord.nombre,
      message: 'Usuario creado satisfactoriamente'
    });
  } catch (error) {
    next(error);
  }
};

exports.listarUsuarios = async (req, res, next) => {
  try {
    const { page, limit, sortBy, order, status } = req.query;
    const { offset, limit: limitVal } = getPagination(page, limit);

    const where = {};
    if (status) {
      where.status = status;
    }

    const sortField = sortBy || 'createdAt';
    const sortOrder = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    const data = await Usuario.findAndCountAll({
      where,
      attributes: ['id', 'correo', 'nombre', 'rut', 'status', 'telefono', 'createdAt'],
      include: [{ model: Rol, attributes: ['id', 'nombre'] }],
      order: [[sortField, sortOrder]],
      limit: limitVal,
      offset
    });

    const pagingData = getPagingData(data, page, limitVal);
    pagingData.rows = UsuarioDTO.fromArray(pagingData.rows);

    res.json(pagingData);
  } catch (error) {
    next(error);
  }
};

exports.obtenerUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      attributes: ['id', 'correo', 'nombre', 'rut', 'status'],
      include: [{ model: Rol, attributes: ['id', 'nombre'] }]
    });
    if (!usuario) throw new NotFoundError('Usuario no encontrado');
    res.json(new UsuarioDTO(usuario));
  } catch (error) {
    next(error);
  }
};

exports.actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { correo, password, rol, rol_id, status } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) throw new NotFoundError('Usuario no encontrado');

    if (correo) usuario.correo = correo;
    if (typeof status !== 'undefined') usuario.status = status;

    if (password) {
      usuario.password_hash = await bcrypt.hash(password, 10);
    }

    if (rol_id) {
      const rolRecord = await Rol.findOne({ where: { id: rol_id, status: 'ACTIVO' } });
      if (!rolRecord) throw new BusinessError('Rol inválido o inactivo');
      await usuario.setRols([rolRecord], { through: { status: 'ACTIVO' } });
    } else if (rol) {
      const rolRecord = await Rol.findOne({ where: { nombre: rol.toUpperCase(), status: 'ACTIVO' } });
      if (!rolRecord) throw new BusinessError('Rol inválido o inactivo');
      await usuario.setRols([rolRecord], { through: { status: 'ACTIVO' } });
    }

    await usuario.save();

    const updated = await Usuario.findByPk(id, {
      attributes: ['id', 'correo', 'nombre', 'rut', 'status'],
      include: [{ model: Rol, attributes: ['id', 'nombre'] }]
    });

    res.json(new UsuarioDTO(updated));
  } catch (error) {
    next(error);
  }
};

exports.eliminarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) throw new NotFoundError('Usuario no encontrado');

    // Soft delete: marcar INACTIVO
    usuario.status = 'INACTIVO';
    await usuario.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
