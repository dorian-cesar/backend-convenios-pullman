/**
 * Busqueda por múltiples campos: pnr, numero_ticket, rut, nombre
 * Para los 2 eventos sospechosos de la imagen
 */
require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function buscarEvento(label, whereExtra) {
  const [rows] = await seq.query(`
    SELECT
      e.id, e.tipo_evento, e.estado,
      e.numero_ticket, e.pnr, e.confirmed_pnrs,
      e.tarifa_base, e.monto_pagado, e.monto_descuento,
      e.porcentaje_descuento_aplicado,
      e.tipo_pago, e.codigo_autorizacion,
      e.ciudad_origen, e.ciudad_destino,
      e.fecha_viaje, e.fecha_evento,
      e.numero_asiento,
      e.convenio_id, c.nombre AS convenio_nombre,
      e.empresa_id, emp.nombre AS empresa_nombre,
      p.rut, p.nombres, p.apellidos,
      e.created_by, e.createdAt, e.updatedAt
    FROM eventos e
    LEFT JOIN pasajeros  p   ON e.pasajero_id  = p.id
    LEFT JOIN empresas   emp ON e.empresa_id   = emp.id
    LEFT JOIN convenios  c   ON e.convenio_id  = c.id
    WHERE ${whereExtra}
    ORDER BY e.id ASC
  `);
  if (rows.length === 0) {
    console.log(`  [${label}] ❌ Sin resultados`);
    return;
  }
  rows.forEach(ev => {
    const base   = Number(ev.tarifa_base)     || 0;
    const pagado = Number(ev.monto_pagado)    || 0;
    const desc   = Number(ev.monto_descuento) || 0;
    const pctReal = base > 0 ? ((base - pagado) / base * 100).toFixed(1) + '%' : 'N/A';
    console.log(`\n  [${label}] ✅ Evento ID=${ev.id}`);
    console.log(`    tipo_evento:      ${ev.tipo_evento} | estado: ${ev.estado}`);
    console.log(`    Pasajero:         ${ev.rut} — ${ev.nombres} ${ev.apellidos}`);
    console.log(`    Empresa:          [${ev.empresa_id}] ${ev.empresa_nombre}`);
    console.log(`    Convenio:         [${ev.convenio_id}] ${ev.convenio_nombre}`);
    console.log(`    numero_ticket:    ${ev.numero_ticket}`);
    console.log(`    pnr:              ${ev.pnr}`);
    console.log(`    confirmed_pnrs:   ${JSON.stringify(ev.confirmed_pnrs)}`);
    console.log(`    ciudad:           ${ev.ciudad_origen} → ${ev.ciudad_destino}`);
    console.log(`    fecha_viaje:      ${ev.fecha_viaje}  |  asiento: ${ev.numero_asiento}`);
    console.log(`    fecha_evento:     ${ev.fecha_evento}`);
    console.log(`    ── MONTOS ──────────────────────────────────`);
    console.log(`    tarifa_base:      $${base.toLocaleString('es-CL')}`);
    console.log(`    monto_pagado:     $${pagado.toLocaleString('es-CL')}`);
    console.log(`    monto_descuento:  $${desc.toLocaleString('es-CL')}`);
    console.log(`    % descuento REAL: ${pctReal}`);
    console.log(`    pct_guardado:     ${ev.porcentaje_descuento_aplicado}%`);
    console.log(`    tipo_pago:        ${ev.tipo_pago}`);
    console.log(`    cod_autorizacion: ${ev.codigo_autorizacion}`);
    console.log(`    ── AUDITORÍA ───────────────────────────────`);
    console.log(`    created_by:       ${ev.created_by}`);
    console.log(`    createdAt:        ${ev.createdAt}`);
    console.log(`    updatedAt:        ${ev.updatedAt}`);

    // Diagnóstico
    if (pagado === 0 && base > 0) {
      console.log(`    🔴 DIAGNÓSTICO: monto_pagado=$0 → el sistema calculó descuento=$${base.toLocaleString('es-CL')} (100%)`);
      console.log(`       CAUSA: El frontend envió monto_pagado=0 al backend.`);
    } else if (pagado === desc && pagado > 0) {
      console.log(`    🟡 DIAGNÓSTICO: monto_pagado = monto_descuento = $${pagado.toLocaleString('es-CL')}`);
      console.log(`       Descuento real aplicado: ${pctReal} sobre tarifa $${base.toLocaleString('es-CL')}`);
    }
  });
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  BÚSQUEDA MULTI-CAMPO: Tickets TS535803815 / TS535725621        ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Búsqueda por numero_ticket
  await buscarEvento('numero_ticket=TS535803815', "e.numero_ticket = 'TS535803815'");
  await buscarEvento('numero_ticket=TS535725621', "e.numero_ticket = 'TS535725621'");

  // Búsqueda por PNR
  await buscarEvento('pnr=TS535803815', "e.pnr = 'TS535803815'");
  await buscarEvento('pnr=TS535725621', "e.pnr = 'TS535725621'");

  // Búsqueda en confirmed_pnrs (JSON que puede contener estos valores)
  await buscarEvento('confirmed_pnrs LIKE TS535803815', "e.confirmed_pnrs LIKE '%TS535803815%'");
  await buscarEvento('confirmed_pnrs LIKE TS535725621', "e.confirmed_pnrs LIKE '%TS535725621%'");

  // Búsqueda por RUT del pasajero (imagen: 18398273-9 y 12618571-5)
  console.log('\n── BÚSQUEDA POR RUT ────────────────────────────────────────────────');
  await buscarEvento('rut=18398273-9', "p.rut = '18398273-9'");
  await buscarEvento('rut=12618571-5', "p.rut = '12618571-5'");

  // Búsqueda por nombre (imagen: Priscila Ariel Soto y Nelson Roberto Torres Pastenes)
  console.log('\n── BÚSQUEDA POR NOMBRE ─────────────────────────────────────────────');
  await buscarEvento('nombre=Priscila', "p.nombres LIKE '%Priscila%'");
  await buscarEvento('nombre=Torres Pastenes', "p.apellidos LIKE '%Torres Pastenes%'");

  console.log('\n\n✅ Búsqueda completada. No se modificó ningún dato.\n');
  process.exit(0);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
