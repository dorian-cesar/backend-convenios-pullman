const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const [results] = await sequelize.query(`SELECT id, rut FROM pasajeros LIMIT 5`);
    console.log('--- Pasajeros disponibles ---');
    results.forEach(p => {
      console.log(`ID: ${p.id}, RUT: ${p.rut}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
