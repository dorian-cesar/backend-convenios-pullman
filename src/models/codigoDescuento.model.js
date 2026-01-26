const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const CodigoDescuento = sequelize.define('CodigoDescuento', {
  codigo: { type: DataTypes.STRING, unique: true },
  fecha_inicio: DataTypes.DATE,
  fecha_termino: DataTypes.DATE,
  status: { type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'BLOCKED'), defaultValue: 'ACTIVE' }
}, {
  tableName: 'codigos_descuento',
  underscored: true
});

module.exports = CodigoDescuento;