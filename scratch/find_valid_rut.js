const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const [results] = await sequelize.query(`SELECT rut FROM clientes_corporativos_compromiso_pullman_nomina WHERE status = 'ACTIVO' LIMIT 1`);
    if (results.length > 0) {
      console.log(`Valid RUT found: ${results[0].rut}`);
    } else {
      console.log('No valid RUT found in nomina');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
