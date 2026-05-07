const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const ruts = ['10624442-1', '22365842-3', '19595858-0'];
    
    for (const rut of ruts) {
      const [pasajero] = await sequelize.query(`
        SELECT id, rut, nombres, apellidos, empresa_id, convenio_id, status, createdAt
        FROM pasajeros
        WHERE rut = '${rut}'
      `);
      
      console.log(`--- Pasajero: ${rut} ---`);
      if (pasajero.length > 0) {
        console.log(JSON.stringify(pasajero[0], null, 2));
      } else {
        console.log('No encontrado');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
