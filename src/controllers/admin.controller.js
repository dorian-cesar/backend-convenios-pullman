const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');

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
    }

    if (!rolRecord) {
      throw new BusinessError('Rol inválido o inactivo');
    }

    const hash = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      correo,
      password: hash,
      rol_id: rolRecord.id
    });

    res.status(201).json({
      id: usuario.id,
      correo: usuario.correo,
      rol: rolRecord.nombre
    });
  } catch (error) {
    next(error);
  }
};

exports.listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'correo', 'status'],
      include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombre'] }]
    });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

exports.obtenerUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      attributes: ['id', 'correo', 'status'],
      include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombre'] }]
    });
    if (!usuario) throw new NotFoundError('Usuario no encontrado');
    res.json(usuario);
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
      usuario.password = await bcrypt.hash(password, 10);
    }

    if (rol_id) {
      const rolRecord = await Rol.findOne({ where: { id: rol_id, status: 'ACTIVO' } });
      if (!rolRecord) throw new BusinessError('Rol inválido o inactivo');
      usuario.rol_id = rolRecord.id;
    } else if (rol) {
      const rolRecord = await Rol.findOne({ where: { nombre: rol.toUpperCase(), status: 'ACTIVO' } });
      if (!rolRecord) throw new BusinessError('Rol inválido o inactivo');
      usuario.rol_id = rolRecord.id;
    }

    await usuario.save();

    const updated = await Usuario.findByPk(id, {
      attributes: ['id', 'correo', 'status'],
      include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombre'] }]
    });

    res.json(updated);
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
