require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  const RUT = '19027493-4';
  const EVENTO_ID = 13409;

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  INVESTIGACIÓN: Evento #13409 - FACh - RUT 19027493-4       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── 1. Datos completos del evento ─────────────────────────────────────────
  const [evRows] = await seq.query(`
    SELECT e.*,
           p.rut, p.nombres, p.apellidos, p.correo,
           emp.nombre AS empresa_nombre,
           c.nombre   AS convenio_nombre, c.tipo, c.tipo_descuento, c.valor_descuento, c.porcentaje_descuento
    FROM eventos e
    LEFT JOIN pasajeros  p   ON e.pasajero_id  = p.id
    LEFT JOIN empresas   emp ON e.empresa_id   = emp.id
    LEFT JOIN convenios  c   ON e.convenio_id  = c.id
    WHERE e.id = ${EVENTO_ID}
  `);
  const ev = evRows[0];
  if (!ev) { console.log('❌ Evento no encontrado'); process.exit(1); }

  console.log('── EVENTO ──────────────────────────────────────────────────────');
  console.log(`  ID:              ${ev.id} | ${ev.tipo_evento} | ${ev.estado}`);
  console.log(`  Fecha:           ${ev.fecha_evento}`);
  console.log(`  Pasajero ID:     ${ev.pasajero_id}`);
  console.log(`  Pasajero RUT:    ${ev.rut} — ${ev.nombres} ${ev.apellidos}`);
  console.log(`  Correo:          ${ev.correo}`);
  console.log(`  Empresa:         [${ev.empresa_id}] ${ev.empresa_nombre}`);
  console.log(`  Convenio:        [${ev.convenio_id}] ${ev.convenio_nombre}`);
  console.log(`  tipo:            ${ev.tipo} | tipo_descuento: ${ev.tipo_descuento}`);
  console.log(`  porcentaje_desc: ${ev.porcentaje_descuento}% | valor_desc: ${ev.valor_descuento}`);
  console.log(`  Ruta:            ${ev.ciudad_origen} → ${ev.ciudad_destino}`);
  console.log(`  fecha_viaje:     ${ev.fecha_viaje} | asiento: ${ev.numero_asiento}`);
  console.log(`  numero_ticket:   ${ev.numero_ticket}`);
  console.log(`  pnr:             ${ev.pnr}`);
  console.log(`  tarifa_base:     $${Number(ev.tarifa_base).toLocaleString('es-CL')}`);
  console.log(`  monto_pagado:    $${Number(ev.monto_pagado).toLocaleString('es-CL')}`);
  console.log(`  monto_descuento: $${Number(ev.monto_descuento).toLocaleString('es-CL')}`);
  console.log(`  % desc real:     ${ev.tarifa_base > 0 ? ((ev.monto_descuento / ev.tarifa_base) * 100).toFixed(1) : 'N/A'}%`);
  console.log(`  tipo_pago:       ${ev.tipo_pago} | cod_auth: ${ev.codigo_autorizacion}`);
  console.log(`  created_by:      ${ev.created_by}`);

  // ── 2. ¿Está en la nómina FACh? ──────────────────────────────────────────
  console.log('\n── VALIDACIÓN NÓMINA FACH ──────────────────────────────────────');

  // Primero detectar la tabla de nómina FACh
  const [tablas] = await seq.query(`SHOW TABLES LIKE '%fach%'`);
  console.log(`  Tablas FACh encontradas: ${tablas.map(t => Object.values(t)[0]).join(', ') || 'NINGUNA'}`);

  // Tabla estática fach (modelo Fach)
  const [inFach] = await seq.query(`
    SELECT * FROM clientes_corporativos_fach_nomina WHERE rut = '${RUT}'
  `).catch(() => [[]]);

  if (inFach.length === 0) {
    console.log(`  ❌ RUT ${RUT} NO está en la tabla clientes_corporativos_fach_nomina`);
  } else {
    console.log(`  ✅ RUT ${RUT} SÍ está en nómina FACh:`);
    inFach.forEach(r => console.log(`     status=${r.status} | ${JSON.stringify(r)}`));
  }

  // También buscar en tabla dinámica si existe registro corporativo para el convenio FACh
  const [regCorp] = await seq.query(`
    SELECT * FROM registros_tabla_clientes_corporativos WHERE convenio_id = ${ev.convenio_id}
  `).catch(() => [[]]);
  if (regCorp.length > 0) {
    console.log(`\n  Registro corporativo dinámico para convenio ${ev.convenio_id}:`);
    regCorp.forEach(r => console.log(`    tabla: ${r.nombre_tabla}`));
    for (const reg of regCorp) {
      const [enTabla] = await seq.query(
        `SELECT * FROM ${reg.nombre_tabla} WHERE rut = '${RUT}'`
      ).catch(() => [[]]);
      console.log(`  En tabla dinámica "${reg.nombre_tabla}": ${enTabla.length > 0 ? '✅ SÍ' : '❌ NO'}`);
    }
  }

  // ── 3. Historial completo del pasajero con FACh ───────────────────────────
  console.log('\n── HISTORIAL EVENTOS DEL PASAJERO EN FACH ──────────────────────');
  const [historial] = await seq.query(`
    SELECT e.id, e.tipo_evento, e.estado, e.fecha_evento,
           e.pnr, e.numero_ticket, e.tarifa_base, e.monto_pagado,
           e.convenio_id, c.nombre AS convenio_nombre
    FROM eventos e
    LEFT JOIN convenios c ON e.convenio_id = c.id
    WHERE e.pasajero_id = ${ev.pasajero_id}
    ORDER BY e.fecha_evento DESC
  `);
  console.log(`  Total eventos del pasajero: ${historial.length}`);
  historial.forEach(h => {
    const conv = h.convenio_nombre || 'Sin convenio';
    console.log(`  [${h.fecha_evento?.toString().substring(0,10)}] ID=${h.id} | ${h.tipo_evento} | ${h.estado} | conv: ${conv} | pagado: $${Number(h.monto_pagado).toLocaleString('es-CL')}`);
  });

  console.log('\n✅ Investigación completada. No se modificó ningún dato.\n');
  process.exit(0);
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
