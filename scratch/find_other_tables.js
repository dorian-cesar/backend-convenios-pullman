const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, nombre_tabla, convenio_id 
      FROM registro_tablas_clientes_corporativos 
      WHERE convenio_id IN (186, 188)
    `);

    console.log('--- Registros de Tablas para Pillado/FACH ---');
    results.forEach(r => {
      console.log(`Convenio ID: ${r.convenio_id}`);
      console.log(`Tabla: ${r.nombre_tabla}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
