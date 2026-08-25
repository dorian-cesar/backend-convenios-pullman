require('dotenv').config();

module.exports = {
  development: {
    username: process.env.USUARIO_BD,
    password: process.env.CLAVE_BD,
    database: process.env.NOMBRE_BD,
    host: process.env.HOST_BD,
    port: process.env.PORT_BD,
    dialect: 'mysql'
  },
  test: {
    username: process.env.USUARIO_BD,
    password: process.env.CLAVE_BD,
    database: process.env.NOMBRE_BD,
    host: process.env.HOST_BD,
    port: process.env.PORT_BD,
    dialect: 'mysql'
  },
  production: {
    username: process.env.USUARIO_BD,
    password: process.env.CLAVE_BD,
    database: process.env.NOMBRE_BD,
    host: process.env.HOST_BD,
    port: process.env.PORT_BD,
    dialect: 'mysql'
  }
};
