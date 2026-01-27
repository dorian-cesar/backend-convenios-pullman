const Sequelize = require('sequelize');
const sequelize = require('../config/sequelize');

const Usuario = require('./usuario.model')(sequelize, Sequelize.DataTypes);
const Rol = require('./rol.model')(sequelize, Sequelize.DataTypes);
const Empresa = require('./empresa.model')(sequelize, Sequelize.DataTypes);
const UsuarioEmpresa = require('./usuarioEmpresa.model')(sequelize, Sequelize.DataTypes);

/**
 * ROL → USUARIO
 */
Rol.hasMany(Usuario, {
  foreignKey: 'rol_id',
  as: 'usuarios'
});

Usuario.belongsTo(Rol, {
  foreignKey: 'rol_id',
  as: 'rol'
});

/**
 * USUARIO ↔ EMPRESA (tabla pivote con lógica)
 */
Usuario.belongsToMany(Empresa, {
  through: UsuarioEmpresa,
  foreignKey: 'usuario_id',
  otherKey: 'empresa_id',
  as: 'empresas'
});

Empresa.belongsToMany(Usuario, {
  through: UsuarioEmpresa,
  foreignKey: 'empresa_id',
  otherKey: 'usuario_id',
  as: 'usuarios'
});

/**
 * Relaciones directas de la pivote
 */
UsuarioEmpresa.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

UsuarioEmpresa.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

UsuarioEmpresa.belongsTo(Usuario, {
  foreignKey: 'creado_por',
  as: 'creador'
});

module.exports = {
  sequelize,
  Usuario,
  Rol,
  Empresa,
  UsuarioEmpresa
};
