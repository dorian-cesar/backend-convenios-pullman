require('dotenv').config();
const { Sequelize } = require('sequelize');
const { getChileOffset } = require('../utils/timezone');

const { getUserId } = require('../utils/context');

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
      },
      beforeCreate: (instance, options) => {
        const userId = getUserId();
        if (userId) {
          instance.created_by = userId;
          instance.updated_by = userId;
        }
      },
      beforeUpdate: (instance, options) => {
        const userId = getUserId();
        if (userId) {
          instance.updated_by = userId;
        }
      },
      beforeDestroy: async (instance, options) => {
        const userId = getUserId();
        if (userId && instance.constructor.options.paranoid) {
          instance.deleted_by = userId;
          // Guardamos el cambio antes de que se oculte el registro
          await instance.save({ hooks: false, transaction: options.transaction });
        }
      }
    }
  }
);

module.exports = sequelize;
