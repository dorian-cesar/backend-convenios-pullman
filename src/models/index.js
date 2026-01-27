const Sequelize = require('sequelize');
const sequelize = require('../config/sequelize');

const Usuario = require('./usuario.model')(sequelize, Sequelize.DataTypes);
const Rol = require('./rol.model')(sequelize, Sequelize.DataTypes);
const Empresa = require('./empresa.model')(sequelize, Sequelize.DataTypes);

// RELACIONES
Rol.hasMany(Usuario, {
  foreignKey: 'rol_id',
  as: 'usuarios'
});

Usuario.belongsTo(Rol, {
  foreignKey: 'rol_id',
  as: 'rol'
});

module.exports = {
  sequelize,
  Usuario,
  Rol
  , Empresa
};
