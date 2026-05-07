const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, nombre, empresa_id, tipo, status 
      FROM convenios 
      WHERE nombre LIKE '%Pillado%' OR nombre LIKE '%FACH%'
    `);

    console.log('--- Otros Convenios Corporativos ---');
    results.forEach(c => {
      console.log(`ID: ${c.id}`);
      console.log(`Nombre: ${c.nombre}`);
      console.log(`Tipo: ${c.tipo}`);
      console.log(`Status: ${c.status}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
