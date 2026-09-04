const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.HOST_BD,
        user: process.env.USUARIO_BD,
        password: process.env.CLAVE_BD,
        port: process.env.PORT_BD,
        database: process.env.NOMBRE_BD
    });

    try {
        console.log(`Conectado a la BD productiva: ${process.env.NOMBRE_BD}`);
        console.log('Agregando columnas a la tabla convenios...');
        await conn.query('ALTER TABLE convenios ADD COLUMN inscripcion_activa TINYINT(1) DEFAULT 0');
        await conn.query('ALTER TABLE convenios ADD COLUMN fecha_inicio_inscripcion DATETIME DEFAULT NULL');
        await conn.query('ALTER TABLE convenios ADD COLUMN fecha_fin_inscripcion DATETIME DEFAULT NULL');
        console.log('✅ Columnas agregadas con éxito');
    } catch(e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️ Las columnas ya existen en la base de datos productiva.');
        } else {
            console.error('❌ Error alterando tabla:', e);
        }
    }
    
    try {
        console.log('Actualizando convenios anteriores...');
        // Set false by default to old records if null
        await conn.query('UPDATE convenios SET inscripcion_activa = 0 WHERE inscripcion_activa IS NULL');
        console.log('✅ Convenios actualizados con éxito.');
    } catch(e) {
         console.error('❌ Error actualizando registros:', e);
    }
    
    await conn.end();
}
run();
