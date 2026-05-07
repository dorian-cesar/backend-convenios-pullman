const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  try {
    const convenios = [
      { id: 186, nombre: 'Convenio Pillado y Cia', tabla: 'clientes_corporativos_pillado_nomina' },
      { id: 188, nombre: 'Convenio FACH ✈️', tabla: 'clientes_corporativos_fach_nomina' }
    ];

    for (const conv of convenios) {
      console.log(`\n=== Auditing: ${conv.nombre} (ID: ${conv.id}) ===`);
      
      const [eventos] = await sequelize.query(`
        SELECT e.id, e.fecha_evento, p.rut, p.nombres, p.apellidos, e.estado
        FROM eventos e
        JOIN pasajeros p ON e.pasajero_id = p.id
        WHERE e.convenio_id = ${conv.id}
        ORDER BY e.fecha_evento DESC
        LIMIT 10
      `);

      if (eventos.length === 0) {
        console.log('No se encontraron eventos para este convenio.');
        continue;
      }

      for (const ev of eventos) {
        const [nomina] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM ${conv.tabla} 
          WHERE rut = '${ev.rut}'
        `);
        
        const estaEnNomina = nomina[0].count > 0;
        console.log(`[${ev.fecha_evento}] ${ev.rut} - ${estaEnNomina ? 'OK ✅' : 'FUERA DE NÓMINA ❌'}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
