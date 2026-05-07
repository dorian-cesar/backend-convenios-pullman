const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, nombre, empresa_id, api_consulta_id, tipo, status 
      FROM convenios 
      WHERE nombre LIKE '%Compromiso%'
    `);

    console.log('--- Configuración del Convenio en Producción ---');
    results.forEach(c => {
      console.log(`ID: ${c.id}`);
      console.log(`Nombre: ${c.nombre}`);
      console.log(`Empresa ID: ${c.empresa_id}`);
      console.log(`Tipo: ${c.tipo}`);
      console.log(`API Consulta ID: ${c.api_consulta_id}`);
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
