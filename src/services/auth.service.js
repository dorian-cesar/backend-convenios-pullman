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
    where: { correo, status: 'ACTIVO' },
    include: [{ model: Rol }]
  });

  if (!usuario) {
    throw new AuthError('Credenciales inválidas');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValida) {
    throw new AuthError('Credenciales inválidas');
  }

  // En M:N el usuario puede tener varios roles, tomamos el primero o verificamos
  const roles = usuario.Rols;
  if (!roles || roles.length === 0) {
    throw new AuthError('Usuario sin rol asignado');
  }
  const rolNombre = roles[0].nombre;

  const token = jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: rolNombre
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return token;
};

/**
 * REGISTER
 */
exports.register = async ({ correo, password, nombre, rut }) => {
  if (!correo || !password) {
    throw new AuthError('Correo y password son obligatorios');
  }

  const existe = await Usuario.findOne({ where: { correo } });
  if (existe) {
    throw new AuthError('El correo ya está registrado');
  }

  const rolUsuario = await Rol.findOne({
    // Register should create a SUPER_USUARIO by default
    where: { nombre: 'SUPER_USUARIO', status: 'ACTIVO' }
  });

  if (!rolUsuario) {
    throw new AuthError('Rol USUARIO no configurado');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await Usuario.create({
    correo,
    nombre,
    rut,
    password_hash: passwordHash
  });

  // Asignar rol en tabla intermedia
  // Nota: addRol es método mágico de Sequelize por belongsToMany
  await usuario.addRol(rolUsuario, { through: { status: 'ACTIVO' } });

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
