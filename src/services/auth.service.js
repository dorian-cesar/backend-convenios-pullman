const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');
const AuthError = require('../exceptions/AuthError');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * LOGIN
 */
exports.login = async ({ correo, password }) => {
  if (!correo || !password) {
    throw new AuthError('Correo y password son obligatorios');
  }

  const usuario = await Usuario.findOne({
    where: { correo, status: 'ACTIVO' }
  });

  if (!usuario) {
    throw new AuthError('Credenciales inválidas');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw new AuthError('Credenciales inválidas');
  }

  const rol = await Rol.findByPk(usuario.rol_id);

  const token = jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: rol.nombre
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return token;
};

/**
 * REGISTER
 */
exports.register = async ({ correo, password }) => {
  if (!correo || !password) {
    throw new AuthError('Correo y password son obligatorios');
  }

  const existe = await Usuario.findOne({ where: { correo } });
  if (existe) {
    throw new AuthError('El correo ya está registrado');
  }

  const rolUsuario = await Rol.findOne({
    where: { nombre: 'USUARIO', status: 'ACTIVO' }
  });

  if (!rolUsuario) {
    throw new AuthError('Rol USUARIO no configurado');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await Usuario.create({
    correo,
    password: passwordHash,
    rol_id: rolUsuario.id
  });

  const token = jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: rolUsuario.nombre
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return token;
};
