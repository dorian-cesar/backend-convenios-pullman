/**
 * Script: Activar beneficiarios INACTIVOS del convenio 118
 * 
 * Cambia el status de 'INACTIVO' a 'ACTIVO' para todos los beneficiarios
 * que pertenezcan al convenio_id = 118 y que actualmente estén INACTIVOS.
 * NO toca beneficiarios con status 'RECHAZADO' ni de otros convenios.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function activateBeneficiarios() {
  let connection;
  try {
    console.log('Conectando a la base de datos...');
    connection = await mysql.createConnection({
      host: process.env.HOST_BD,
      port: process.env.PORT_BD,
      user: process.env.USUARIO_BD,
      password: process.env.CLAVE_BD,
      database: process.env.NOMBRE_BD,
      connectTimeout: 30000
    });
    console.log('Conexión exitosa.\n');

    // Primero contamos cuántos hay para confirmar
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total 
       FROM beneficiarios 
       WHERE convenio_id = 118 
         AND status = 'INACTIVO' 
         AND deletedAt IS NULL`
    );
    const total = countResult[0].total;
    console.log(`Beneficiarios INACTIVOS en convenio 118: ${total}`);

    if (total === 0) {
      console.log('No hay beneficiarios INACTIVOS para activar. Fin del script.');
      process.exit(0);
    }

    // Ejecutar el UPDATE solo para INACTIVOS del convenio 118
    const [results] = await connection.execute(
      `UPDATE beneficiarios 
       SET status = 'ACTIVO', 
           updatedAt = NOW() 
       WHERE convenio_id = 118 
         AND status = 'INACTIVO' 
         AND deletedAt IS NULL`
    );

    console.log(`\n✅ Beneficiarios actualizados: ${results.affectedRows}`);
    console.log('Todos los INACTIVOS del convenio 118 ahora están ACTIVOS.');

  } catch (error) {
    console.error('❌ Error al ejecutar el script:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    console.log('\nConexión cerrada.');
  }
}

activateBeneficiarios();
