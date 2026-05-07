const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.NOMBRE_BD,
  process.env.USUARIO_BD,
  process.env.CLAVE_BD,
  {
    host: process.env.HOST_BD,
    port: process.env.PORT_BD,
    dialect: 'mysql',
    logging: console.log
  }
);

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    const [results] = await sequelize.query('SELECT 1 as result');
    console.log('Query result:', results);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

test();
