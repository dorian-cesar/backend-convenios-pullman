require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.NOMBRE_BD,
  process.env.USUARIO_BD,
  process.env.CLAVE_BD,
  {
    host: process.env.HOST_BD,
    port: process.env.PORT_BD,
    dialect: 'mysql',
    logging: false,
    timezone: '-04:00', // America/Santiago standard offset (adjust if needed or use named TZ if supported by driver)
  }
);

module.exports = sequelize;
