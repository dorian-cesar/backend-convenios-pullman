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
      connectTimeout: 60000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    hooks: {
      afterConnect: async (connection) => {
        await connection.promise().query("SET SESSION sort_buffer_size = 1048576;"); // 1MB
      }
    }
  }
);

module.exports = sequelize;
