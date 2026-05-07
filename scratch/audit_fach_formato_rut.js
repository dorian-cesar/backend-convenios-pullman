require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));
const { formatRut } = require(path.join(process.cwd(), 'src', 'utils', 'rut.utils'));

async function main() {
  const RUT = '19027493-4';
  const fmt = formatRut(RUT);
  console.log('RUT original:          ', RUT);
  console.log('RUT con formatRut():   ', fmt);

  // Buscar variantes en la nomina
  const [similares] = await seq.query(`SELECT rut FROM clientes_corporativos_fach_nomina WHERE rut LIKE '%19027%' LIMIT 5`);
  console.log('Similares en nomina:', similares);

  // Buscar con el RUT formateado exacto
  const [exacto] = await seq.query(`SELECT * FROM clientes_corporativos_fach_nomina WHERE rut = '${fmt}'`);
  console.log('Búsqueda exacta con formato:', exacto.length > 0 ? 'ENCONTRADO' : 'NO ENCONTRADO');

  // Simular el flujo completo del servicio
  console.log('\n── Simulando resolveRegistro("fach_nomina") ─────────────────────');
  const [reg] = await seq.query(`
    SELECT * FROM registro_tablas_clientes_corporativos
    WHERE (nombre_tabla = 'fach_nomina' OR nombre_tabla = 'clientes_corporativos_fach_nomina')
    AND status = 'ACTIVO'
    LIMIT 1
  `);
  if (reg.length === 0) {
    console.log('  ❌ No se encontró registro corporativo para fach_nomina');
  } else {
    console.log('  ✅ Registro encontrado:', reg[0].nombre_tabla, '| convenio:', reg[0].convenio_id);
    
    // Buscar RUT en la tabla física
    const [cliente] = await seq.query(`SELECT * FROM ${reg[0].nombre_tabla} WHERE rut = '${fmt}'`);
    console.log(`  Búsqueda en ${reg[0].nombre_tabla}:`, cliente.length > 0 ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO');
    
    if (cliente.length > 0) {
      console.log('  Estado:', cliente[0].status);
    }
  }

  // Verificar cuántos de los 14 pasajeros de eventos FACh pasaron la validación correctamente
  // (¿o sea que todos son inválidos en la nomina?)
  const [eventosConRut] = await seq.query(`
    SELECT DISTINCT p.rut
    FROM eventos e
    JOIN pasajeros p ON e.pasajero_id = p.id
    WHERE e.convenio_id = 188 AND e.estado = 'confirmado'
  `);
  
  console.log('\n── Verificación de todos los RUTs de eventos confirmados FACh ───');
  for (const row of eventosConRut) {
    const rutFmt = formatRut(row.rut);
    const [enN] = await seq.query(`SELECT rut, status FROM clientes_corporativos_fach_nomina WHERE rut = '${rutFmt}'`);
    const estado = enN.length > 0 ? `✅ EN NOMINA (${enN[0].status})` : '❌ NO EN NOMINA';
    console.log(`  ${row.rut} → fmt: ${rutFmt} → ${estado}`);
  }

  process.exit(0);
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
