const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, nombre, endpoint, status 
      FROM api_consultas 
      WHERE id = 26
    `);

    console.log('--- API de Consulta 26 ---');
    results.forEach(a => {
      console.log(`ID: ${a.id}`);
      console.log(`Nombre: ${a.nombre}`);
      console.log(`Endpoint: ${a.endpoint}`);
      console.log(`Status: ${a.status}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
