/**
 * AUDIT: Eventos con descuento del 100%
 * ======================================
 * Solo lectura — NO modifica ningún dato.
 *
 * Busca registros donde monto_pagado = monto_descuento,
 * lo que implica que el pasajero pagó $0 (descuento del 100%).
 *
 * También detecta posibles causas:
 *   1. tarifa_base enviada en $0
 *   2. porcentaje_descuento_aplicado = 100
 *   3. monto_pagado = 0 explícitamente
 *   4. tarifa_base - monto_pagado = 0 (mismo valor)
 */

require('dotenv').config();
const path = require('path');
const sequelize = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtMoney = (n) => (n === null || n === undefined ? 'NULL' : `$${Number(n).toLocaleString('es-CL')}`);
const fmtPct   = (n) => (n === null || n === undefined ? 'NULL' : `${n}%`);

function clasificarCausa(ev) {
  const causas = [];

  if (Number(ev.tarifa_base) === 0)
    causas.push('⚠️  tarifa_base = 0 (la tarifa base llegó en cero)');

  if (Number(ev.porcentaje_descuento_aplicado) === 100)
    causas.push('⚠️  porcentaje_descuento_aplicado = 100');

  if (Number(ev.monto_pagado) === 0 && Number(ev.tarifa_base) > 0)
    causas.push('⚠️  monto_pagado = 0 con tarifa_base > 0 (posible error en el frontend o integración)');

  if (
    Number(ev.monto_pagado) > 0 &&
    Number(ev.monto_descuento) > 0 &&
    Number(ev.monto_pagado) === Number(ev.monto_descuento) &&
    Number(ev.tarifa_base) !== 0
  )
    causas.push('⚠️  monto_pagado === monto_descuento (ambos valores iguales pero no cero)');

  if (causas.length === 0)
    causas.push('❓ Causa indeterminada — revisar manualmente');

  return causas;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║   AUDITORÍA: Eventos con Descuento del 100%  (Solo Lectura) ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // ── Consulta 1: monto_pagado = monto_descuento (ambos iguales) ──────────
    const [eventos] = await sequelize.query(`
      SELECT
        e.id,
        e.tipo_evento,
        e.fecha_evento,
        e.estado,
        e.tarifa_base,
        e.monto_pagado,
        e.monto_descuento,
        e.porcentaje_descuento_aplicado,
        e.tipo_pago,
        e.numero_ticket,
        e.pnr,
        e.convenio_id,
        c.nombre        AS convenio_nombre,
        e.empresa_id,
        emp.nombre      AS empresa_nombre,
        p.rut           AS pasajero_rut,
        p.nombres       AS pasajero_nombres,
        p.apellidos     AS pasajero_apellidos
      FROM eventos e
      LEFT JOIN convenios   c   ON e.convenio_id  = c.id
      LEFT JOIN empresas    emp ON e.empresa_id   = emp.id
      LEFT JOIN pasajeros   p   ON e.pasajero_id  = p.id
      WHERE
        e.deletedAt IS NULL
        AND e.monto_pagado IS NOT NULL
        AND e.monto_descuento IS NOT NULL
        AND e.monto_pagado = e.monto_descuento
      ORDER BY e.fecha_evento DESC
    `);

    console.log(`🔍 Eventos con monto_pagado = monto_descuento: ${eventos.length} encontrados\n`);

    if (eventos.length === 0) {
      console.log('✅ No se encontraron eventos sospechosos.');
    } else {
      eventos.forEach((ev, i) => {
        console.log(`── Evento #${i + 1} ─────────────────────────────────────────────`);
        console.log(`   ID:                   ${ev.id}`);
        console.log(`   Tipo:                 ${ev.tipo_evento}  |  Estado: ${ev.estado}`);
        console.log(`   Fecha:                ${ev.fecha_evento}`);
        console.log(`   Pasajero:             ${ev.pasajero_rut} — ${ev.pasajero_nombres} ${ev.pasajero_apellidos}`);
        console.log(`   Empresa:              [${ev.empresa_id}] ${ev.empresa_nombre}`);
        console.log(`   Convenio:             ${ev.convenio_id ? `[${ev.convenio_id}] ${ev.convenio_nombre}` : 'Sin convenio'}`);
        console.log(`   Tipo de pago:         ${ev.tipo_pago || 'NULL'}`);
        console.log(`   Ticket / PNR:         ${ev.numero_ticket || 'NULL'} / ${ev.pnr || 'NULL'}`);
        console.log(`   tarifa_base:          ${fmtMoney(ev.tarifa_base)}`);
        console.log(`   porcentaje_descuento: ${fmtPct(ev.porcentaje_descuento_aplicado)}`);
        console.log(`   monto_pagado:         ${fmtMoney(ev.monto_pagado)}`);
        console.log(`   monto_descuento:      ${fmtMoney(ev.monto_descuento)}`);
        console.log(`   CAUSAS PROBABLES:`);
        clasificarCausa(ev).forEach(c => console.log(`     ${c}`));
        console.log('');
      });
    }

    // ── Consulta 2: Resumen agrupado por causa ───────────────────────────────
    console.log('\n══ RESUMEN POR CAUSA ═══════════════════════════════════════════\n');

    const [tarifa0] = await sequelize.query(`
      SELECT COUNT(*) AS total FROM eventos
      WHERE deletedAt IS NULL AND monto_pagado = monto_descuento AND tarifa_base = 0
    `);
    console.log(`  tarifa_base = 0:                        ${tarifa0[0].total} eventos`);

    const [pct100] = await sequelize.query(`
      SELECT COUNT(*) AS total FROM eventos
      WHERE deletedAt IS NULL AND monto_pagado = monto_descuento AND porcentaje_descuento_aplicado = 100
    `);
    console.log(`  porcentaje_descuento_aplicado = 100:    ${pct100[0].total} eventos`);

    const [pagado0] = await sequelize.query(`
      SELECT COUNT(*) AS total FROM eventos
      WHERE deletedAt IS NULL AND monto_pagado = monto_descuento AND monto_pagado = 0 AND tarifa_base > 0
    `);
    console.log(`  monto_pagado = 0 (con tarifa > 0):      ${pagado0[0].total} eventos`);

    const [igualesNoZero] = await sequelize.query(`
      SELECT COUNT(*) AS total FROM eventos
      WHERE deletedAt IS NULL
        AND monto_pagado = monto_descuento
        AND monto_pagado > 0
        AND tarifa_base != 0
    `);
    console.log(`  monto_pagado = monto_descuento (> 0):   ${igualesNoZero[0].total} eventos`);

    // ── Consulta 3: Agrupar por convenio ─────────────────────────────────────
    console.log('\n══ AFECTADOS POR CONVENIO ══════════════════════════════════════\n');
    const [porConvenio] = await sequelize.query(`
      SELECT
        COALESCE(c.nombre, 'Sin convenio') AS convenio,
        e.convenio_id,
        COUNT(*) AS total
      FROM eventos e
      LEFT JOIN convenios c ON e.convenio_id = c.id
      WHERE e.deletedAt IS NULL AND e.monto_pagado = e.monto_descuento
      GROUP BY e.convenio_id, c.nombre
      ORDER BY total DESC
    `);
    if (porConvenio.length === 0) {
      console.log('  (Ninguno)');
    } else {
      porConvenio.forEach(r => {
        console.log(`  [convenio_id=${r.convenio_id ?? 'NULL'}] ${r.convenio}: ${r.total} evento(s)`);
      });
    }

    // ── Consulta 4: Agrupar por empresa ──────────────────────────────────────
    console.log('\n══ AFECTADOS POR EMPRESA ═══════════════════════════════════════\n');
    const [porEmpresa] = await sequelize.query(`
      SELECT
        emp.nombre AS empresa,
        e.empresa_id,
        COUNT(*) AS total
      FROM eventos e
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      WHERE e.deletedAt IS NULL AND e.monto_pagado = e.monto_descuento
      GROUP BY e.empresa_id, emp.nombre
      ORDER BY total DESC
    `);
    if (porEmpresa.length === 0) {
      console.log('  (Ninguno)');
    } else {
      porEmpresa.forEach(r => {
        console.log(`  [empresa_id=${r.empresa_id}] ${r.empresa}: ${r.total} evento(s)`);
      });
    }

    // ── Consulta 5: Agrupar por tipo_pago ────────────────────────────────────
    console.log('\n══ AFECTADOS POR TIPO DE PAGO ══════════════════════════════════\n');
    const [porTipoPago] = await sequelize.query(`
      SELECT
        COALESCE(tipo_pago, 'NULL/Sin tipo') AS tipo_pago,
        COUNT(*) AS total
      FROM eventos
      WHERE deletedAt IS NULL AND monto_pagado = monto_descuento
      GROUP BY tipo_pago
      ORDER BY total DESC
    `);
    if (porTipoPago.length === 0) {
      console.log('  (Ninguno)');
    } else {
      porTipoPago.forEach(r => {
        console.log(`  tipo_pago=${r.tipo_pago}: ${r.total} evento(s)`);
      });
    }

    console.log('\n✅ Auditoría completada. No se modificó ningún dato.\n');

  } catch (err) {
    console.error('❌ Error en auditoría:', err.message);
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
