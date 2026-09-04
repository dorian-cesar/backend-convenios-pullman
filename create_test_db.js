require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('convenios', process.env.USUARIO_BD, process.env.CLAVE_BD, {
    host: process.env.HOST_BD,
    port: process.env.PORT_BD,
    dialect: 'mysql'
});

async function run() {
    try {
        await sequelize.query('CREATE DATABASE IF NOT EXISTS `convenios-dev`;');
        console.log('Base de datos convenios-dev creada exitosamente.');
    } catch(e) {
        console.error('Error:', e);
    } finally {
        await sequelize.close();
    }
}
run();
