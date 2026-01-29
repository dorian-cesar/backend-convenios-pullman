const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');
const AuthError = require('../exceptions/AuthError');
const BusinessError = require('../exceptions/BusinessError');
const AuthResponseDto = require('../dtos/auth/auth-response.dto');

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

  // En M:N el usuario puede tener varios roles
  let roles = usuario.Rols || usuario.roles || usuario.Roles || [];
  if (roles.length === 0) {
    roles = await usuario.getRoles();
  }

  if (!roles || roles.length === 0) {
    throw new AuthError('Usuario sin rol asignado');
  }

  const firstRol = roles[0];
  const rolNombre = firstRol.nombre;

  const token = jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: rolNombre
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return AuthResponseDto.from(usuario, firstRol, token);
};

/**
 * REGISTER
 */
exports.register = async ({ correo, password, nombre, rut, telefono }) => {
  if (!correo || !password) {
    throw new AuthError('Correo y password son obligatorios');
  }

  const existe = await Usuario.findOne({ where: { correo } });
  if (existe) {
    throw new BusinessError('El correo ya está registrado');
  }

  const rolUsuario = await Rol.findOne({
    // Register should create a SUPER_USUARIO by default
    where: { nombre: 'SUPER_USUARIO', status: 'ACTIVO' }
  });

  if (!rolUsuario) {
    throw new AuthError('Rol SUPER_USUARIO no configurado');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await Usuario.create({
    correo,
    nombre,
    rut,
    telefono,
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

  return AuthResponseDto.from(usuario, rolUsuario, token);
};
