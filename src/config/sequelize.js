require('dotenv').config();
const { Sequelize } = require('sequelize');
const { getChileOffset } = require('../utils/timezone');

const sequelize = new Sequelize(
  process.env.NOMBRE_BD,
  process.env.USUARIO_BD,
  process.env.CLAVE_BD,
  {
    host: process.env.HOST_BD,
    port: process.env.PORT_BD,
    dialect: 'mysql',
    logging: false,
    timezone: getChileOffset(), // Dynamic offset depending on DST (summer/winter time)
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    }
  }
);

module.exports = sequelize;
