require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.NOMBRE_BD, process.env.USUARIO_BD, process.env.CLAVE_BD, { host: process.env.HOST_BD, dialect: 'mysql' });
sequelize.query('ALTER TABLE eventos ADD COLUMN origen_compra ENUM("WEB", "TOTEM", "OTRO") DEFAULT "WEB";').then(() => {
  console.log('Column added');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
