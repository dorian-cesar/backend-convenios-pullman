const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const [results] = await sequelize.query(`SHOW TABLES`);
    console.log('--- Tablas en la Base de Datos ---');
    results.forEach(t => {
      console.log(Object.values(t)[0]);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
