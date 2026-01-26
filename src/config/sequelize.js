const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.NOMBRE_BD,
  process.env.USUARIO_BD,
  process.env.CLAVE_BD,
  {
    host: process.env.HOST_BD,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
