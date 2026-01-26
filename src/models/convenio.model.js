const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Convenio = sequelize.define('Convenio', {
  nombre: DataTypes.STRING,
  tipo: DataTypes.ENUM('EMPRESA', 'CODIGO'),
  status: { type: DataTypes.ENUM('ACTIVE', 'BLOCKED'), defaultValue: 'ACTIVE' }
}, {
  tableName: 'convenios',
  underscored: true
});

module.exports = Convenio;
