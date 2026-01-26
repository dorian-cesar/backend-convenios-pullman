// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/sequelize');

// const Evento = sequelize.define('Evento', {
//   tipo_evento: {
//     type: DataTypes.ENUM('COMPRA', 'ANULACION', 'CAMBIO_ASIENTO'),
//     allowNull: false
//   },
//   ciudad_origen: DataTypes.STRING,
//   ciudad_destino: DataTypes.STRING,
//   asiento: DataTypes.STRING,
//   monto_original: DataTypes.INTEGER,
//   porcentaje_descuento_aplicado: DataTypes.DECIMAL(5,2),
//   monto_pagado: DataTypes.INTEGER,
//   status: {
//     type: DataTypes.ENUM('ACTIVE', 'CANCELLED'),
//     defaultValue: 'ACTIVE'
//   }
// }, {
//   tableName: 'eventos',
//   underscored: true
// });

// module.exports = Evento;
