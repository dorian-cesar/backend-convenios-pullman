const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.HOST_BD,
            user: process.env.USUARIO_BD,
            password: process.env.CLAVE_BD,
            port: process.env.PORT_BD
        });
        await connection.query('CREATE DATABASE IF NOT EXISTS `convenios-dev`;');
        console.log('Base de datos convenios-dev creada exitosamente.');
        await connection.end();
    } catch(e) {
        console.error('Error:', e.message);
    }
}
run();
