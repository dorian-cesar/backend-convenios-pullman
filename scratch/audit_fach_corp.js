require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  const RUT = '19027493-4';

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  INVESTIGACIÓN: FACh como Cliente Corporativo               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // 1. Convenio FACh 188 — qué endpoint tiene configurado
  const [conv] = await seq.query(`
    SELECT id, nombre, tipo, api_consulta_id, tipo_descuento,
           valor_descuento, porcentaje_descuento, status
    FROM convenios WHERE id = 188
  `);
  console.log('── Convenio FACh [188] ─────────────────────────────────────────');
  conv.forEach(c => console.log(JSON.stringify(c, null, 2)));

  // 2. ¿Tiene registro en registros_tabla_clientes_corporativos?
  const [regCorp] = await seq.query(`
    SELECT * FROM registros_tabla_clientes_corporativos WHERE convenio_id = 188
  `).catch(() => [[]]);
  console.log('\n── Registro tabla corporativa para convenio 188 ────────────────');
  if (regCorp.length === 0) {
    console.log('  No hay registro en registros_tabla_clientes_corporativos');
  } else {
    regCorp.forEach(r => console.log(JSON.stringify(r, null, 2)));

    // 3. Buscar el RUT en esa tabla dinámica
    for (const reg of regCorp) {
      const tablaDinamica = reg.nombre_tabla;
      console.log(`\n── Buscando RUT ${RUT} en tabla dinámica "${tablaDinamica}" ─`);
      const [enTabla] = await seq.query(
        `SELECT * FROM ${tablaDinamica} WHERE rut = '${RUT}'`
      ).catch(e => { console.log(`  Error consultando tabla: ${e.message}`); return [[]]; });
      if (enTabla.length === 0) {
        console.log(`  ❌ RUT ${RUT} NO está en la tabla ${tablaDinamica}`);
      } else {
        console.log(`  ✅ RUT ${RUT} SÍ está en ${tablaDinamica}:`);
        enTabla.forEach(r => console.log(`    ${JSON.stringify(r)}`));
      }

      // Total registros en esa tabla
      const [[{ total }]] = await seq.query(`SELECT COUNT(*) as total FROM ${tablaDinamica}`);
      console.log(`  Total registros en ${tablaDinamica}: ${total}`);
    }
  }

  // 4. Ver empresa ID 106 (FACh)
  const [empresa] = await seq.query(`SELECT * FROM empresas WHERE id = 106`);
  console.log('\n── Empresa FACh [106] ──────────────────────────────────────────');
  empresa.forEach(e => console.log(JSON.stringify(e, null, 2)));

  // 5. ¿Cuántos eventos del convenio 188 hay en total?
  const [totalEventos] = await seq.query(`
    SELECT COUNT(*) as total, estado FROM eventos
    WHERE convenio_id = 188
    GROUP BY estado
  `);
  console.log('\n── Eventos del convenio FACh [188] por estado ──────────────────');
  totalEventos.forEach(r => console.log(`  ${r.estado}: ${r.total}`));

  // 6. ¿Cuántos pasajeros NO están en la tabla nomina?
  // Primero ver cuál es la tabla de nomina del convenio FACh
  const [tablas] = await seq.query(`SHOW TABLES LIKE '%fach%'`);
  console.log('\n── Tablas con "fach" en nombre ─────────────────────────────────');
  tablas.forEach(t => console.log(`  ${Object.values(t)[0]}`));

  console.log('\n✅ Investigación completada. No se modificó ningún dato.\n');
  process.exit(0);
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
