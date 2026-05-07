/**
 * Investigación profunda de 2 eventos específicos con descuento aparente del 100%
 * Tickets: TS535803815 (Carabineros) y TS535725621 (Caja Los Andes)
 * Solo lectura — NO modifica nada.
 */
require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

const TICKETS = ['TS535803815', 'TS535725621'];

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  INVESTIGACIÓN: 2 Eventos con descuento aparente del 100%       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  for (const ticket of TICKETS) {
    console.log(`\n${'═'.repeat(65)}`);
    console.log(`  TICKET: ${ticket}`);
    console.log(`${'═'.repeat(65)}`);

    // ── 1. Evento principal ──────────────────────────────────────────
    const [eventos] = await seq.query(`
      SELECT
        e.*,
        p.rut, p.nombres, p.apellidos, p.correo,
        emp.nombre AS empresa_nombre,
        c.nombre   AS convenio_nombre,
        c.tipo_descuento, c.valor_descuento, c.porcentaje_descuento,
        c.tipo AS convenio_tipo
      FROM eventos e
      LEFT JOIN pasajeros  p   ON e.pasajero_id  = p.id
      LEFT JOIN empresas   emp ON e.empresa_id   = emp.id
      LEFT JOIN convenios  c   ON e.convenio_id  = c.id
      WHERE e.numero_ticket = '${ticket}'
      ORDER BY e.id ASC
    `);

    if (eventos.length === 0) {
      console.log(`  ❌ No se encontró ningún evento para el ticket ${ticket}`);
      continue;
    }

    eventos.forEach((ev, i) => {
      const base   = Number(ev.tarifa_base)   || 0;
      const pagado = Number(ev.monto_pagado)  || 0;
      const desc   = Number(ev.monto_descuento) || 0;
      const pctReal = base > 0 ? ((base - pagado) / base * 100).toFixed(1) : 'N/A';

      console.log(`\n  [Registro #${i+1}]`);
      console.log(`  ID evento:              ${ev.id}`);
      console.log(`  tipo_evento:            ${ev.tipo_evento}`);
      console.log(`  estado:                 ${ev.estado}`);
      console.log(`  fecha_evento:           ${ev.fecha_evento}`);
      console.log(`  fecha_viaje:            ${ev.fecha_viaje}`);
      console.log(`  Pasajero:               ${ev.rut} — ${ev.nombres} ${ev.apellidos}`);
      console.log(`  Correo:                 ${ev.correo}`);
      console.log(`  Empresa:                [${ev.empresa_id}] ${ev.empresa_nombre}`);
      console.log(`  Convenio:               [${ev.convenio_id}] ${ev.convenio_nombre}`);
      console.log(`  Convenio tipo:          ${ev.convenio_tipo}`);
      console.log(`  Convenio tipo_descuento:${ev.tipo_descuento}`);
      console.log(`  Convenio valor_desc:    ${ev.valor_descuento}`);
      console.log(`  Convenio pct_desc:      ${ev.porcentaje_descuento}%`);
      console.log(`  ───── MONTOS ────────────────────────────────────`);
      console.log(`  tarifa_base:            $${base.toLocaleString('es-CL')}`);
      console.log(`  porcentaje_aplicado BD: ${ev.porcentaje_descuento_aplicado}%`);
      console.log(`  monto_pagado:           $${pagado.toLocaleString('es-CL')}`);
      console.log(`  monto_descuento:        $${desc.toLocaleString('es-CL')}`);
      console.log(`  monto_devolucion:       ${ev.monto_devolucion}`);
      console.log(`  % descuento REAL:       ${pctReal}%`);
      console.log(`  ───── PAGO ──────────────────────────────────────`);
      console.log(`  tipo_pago:              ${ev.tipo_pago}`);
      console.log(`  codigo_autorizacion:    ${ev.codigo_autorizacion}`);
      console.log(`  token:                  ${ev.token}`);
      console.log(`  pnr:                    ${ev.pnr}`);
      console.log(`  confirmed_pnrs:         ${JSON.stringify(ev.confirmed_pnrs)}`);
      console.log(`  respuesta_kupos:        ${ev.respuesta_kupos ? JSON.stringify(ev.respuesta_kupos).substring(0, 300) : 'NULL'}`);
      console.log(`  ciudad_origen:          ${ev.ciudad_origen}`);
      console.log(`  ciudad_destino:         ${ev.ciudad_destino}`);
      console.log(`  numero_asiento:         ${ev.numero_asiento}`);
      console.log(`  ───── AUDITORÍA ─────────────────────────────────`);
      console.log(`  created_by:             ${ev.created_by}`);
      console.log(`  createdAt:              ${ev.createdAt}`);
      console.log(`  updatedAt:              ${ev.updatedAt}`);
      console.log(`  deletedAt:              ${ev.deletedAt}`);
    });

    // ── 2. Buscar también por PNR en caso de que existan eventos relacionados ─
    const ev0 = eventos[0];
    if (ev0.pnr) {
      const [porPnr] = await seq.query(`
        SELECT id, tipo_evento, estado, monto_pagado, monto_descuento, monto_devolucion, fecha_evento
        FROM eventos
        WHERE pnr = '${ev0.pnr}' AND id != ${ev0.id}
      `);
      if (porPnr.length > 0) {
        console.log(`\n  ⚠️  Otros eventos con el mismo PNR (${ev0.pnr}):`);
        porPnr.forEach(r => console.log(`     → ID=${r.id} | ${r.tipo_evento} | ${r.estado} | pagado=$${r.monto_pagado} | desc=$${r.monto_descuento} | dev=$${r.monto_devolucion} | ${r.fecha_evento}`));
      }
    }

    // ── 3. Diagnóstico ───────────────────────────────────────────────
    const ev = eventos[0];
    const base   = Number(ev.tarifa_base)    || 0;
    const pagado = Number(ev.monto_pagado)   || 0;
    const desc   = Number(ev.monto_descuento) || 0;

    console.log(`\n  ━━ DIAGNÓSTICO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    if (pagado === 0 && base > 0) {
      console.log(`  🔴 monto_pagado = $0 con tarifa_base = $${base.toLocaleString('es-CL')}`);
      console.log(`     El frontend/integración envió monto_pagado = 0.`);
      console.log(`     → monto_descuento = ${base} - 0 = ${base} (100% descuento calculado)`);
    } else if (pagado === desc && pagado > 0) {
      console.log(`  🟡 monto_pagado === monto_descuento = $${pagado.toLocaleString('es-CL')}`);
      console.log(`     Descuento real = ${base > 0 ? ((base-pagado)/base*100).toFixed(1) : 'N/A'}% sobre tarifa_base $${base.toLocaleString('es-CL')}`);
    }
    if (ev.convenio_tipo === 'API_EXTERNA' && ev.tipo_descuento === 'Tarifa Plana') {
      console.log(`  ℹ️  Convenio de Tarifa Plana: el frontend calcula el precio final`);
      console.log(`     y lo envía como monto_pagado. El backend NO recalcula.`);
    }
  }

  console.log('\n\n✅ Investigación completada. No se modificó ningún dato.\n');
  process.exit(0);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
