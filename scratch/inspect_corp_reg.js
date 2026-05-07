const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, nombre_tabla, nombre_display, empresa_id, convenio_id, status 
      FROM registro_tablas_clientes_corporativos 
      WHERE nombre_tabla LIKE '%compromiso_pullman%'
    `);

    console.log('--- Registro de Tabla Corporativa ---');
    results.forEach(r => {
      console.log(`ID: ${r.id}`);
      console.log(`Tabla: ${r.nombre_tabla}`);
      console.log(`Display: ${r.nombre_display}`);
      console.log(`Empresa ID: ${r.empresa_id}`);
      console.log(`Convenio ID: ${r.convenio_id}`);
      console.log(`Status: ${r.status}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
