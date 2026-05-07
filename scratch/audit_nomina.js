const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    // 1. Obtener los últimos 20 eventos del convenio 184
    const [eventos] = await sequelize.query(`
      SELECT e.id, e.fecha_evento, p.rut, p.nombres, p.apellidos, e.monto_pagado, e.estado
      FROM eventos e
      JOIN pasajeros p ON e.pasajero_id = p.id
      WHERE e.convenio_id = 184
      ORDER BY e.fecha_evento DESC
      LIMIT 20
    `);

    console.log('--- Últimas 20 Compras del Convenio 184 ---');
    
    for (const ev of eventos) {
      // 2. Verificar si cada RUT está en la nómina
      const [nomina] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM clientes_corporativos_compromiso_pullman_nomina 
        WHERE rut = '${ev.rut}'
      `);
      
      const estaEnNomina = nomina[0].count > 0;
      
      console.log(`Fecha: ${ev.fecha_evento}`);
      console.log(`Pasajero: ${ev.rut} - ${ev.nombres} ${ev.apellidos}`);
      console.log(`Estado: ${ev.estado}`);
      console.log(`¿Está en Nómina?: ${estaEnNomina ? 'SÍ' : 'NO ❌'}`);
      console.log('---');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
