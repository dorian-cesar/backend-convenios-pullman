require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  // 1. Buscar el pasajero "Priscila Ariel Soto" por nombre (puede tener RUT distinto al de la imagen)
  const [pasajeros] = await seq.query(`
    SELECT id, rut, nombres, apellidos, correo
    FROM pasajeros
    WHERE nombres LIKE '%Priscila%' OR apellidos LIKE '%Soto%'
    ORDER BY apellidos
  `);
  console.log('\n=== Pasajeros con nombre Priscila o apellido Soto ===');
  pasajeros.forEach(p => console.log(`  ID=${p.id} | ${p.rut} | ${p.nombres} ${p.apellidos} | ${p.correo}`));

  // 2. Buscar eventos del convenio Carabineros (cualquier id) con monto_pagado = 0
  const [carab] = await seq.query(`
    SELECT e.id, e.tipo_evento, e.estado,
           e.numero_ticket, e.pnr,
           e.tarifa_base, e.monto_pagado, e.monto_descuento,
           e.tipo_pago, e.codigo_autorizacion,
           e.ciudad_origen, e.ciudad_destino, e.fecha_viaje, e.fecha_evento,
           e.convenio_id, c.nombre AS convenio_nombre,
           e.empresa_id, emp.nombre AS empresa_nombre,
           p.rut, p.nombres, p.apellidos
    FROM eventos e
    LEFT JOIN pasajeros  p   ON e.pasajero_id  = p.id
    LEFT JOIN empresas   emp ON e.empresa_id   = emp.id
    LEFT JOIN convenios  c   ON e.convenio_id  = c.id
    WHERE (c.nombre LIKE '%carabinero%' OR emp.nombre LIKE '%carabinero%')
      AND e.monto_pagado = 0
    ORDER BY e.fecha_evento DESC
  `);
  console.log('\n=== Eventos Carabineros con monto_pagado=0 ===', carab.length, 'encontrados');
  carab.forEach(ev => {
    console.log(`  ID=${ev.id} | pnr=${ev.pnr} | ticket=${ev.numero_ticket}`);
    console.log(`  ${ev.rut} — ${ev.nombres} ${ev.apellidos}`);
    console.log(`  tarifa=$${ev.tarifa_base} | pagado=$${ev.monto_pagado} | desc=$${ev.monto_descuento}`);
    console.log(`  ${ev.ciudad_origen} → ${ev.ciudad_destino} | viaje: ${ev.fecha_viaje}`);
    console.log('');
  });

  // 3. Buscar el PNR TS35803815 o TS535803815 o variantes
  const pnrVariants = ['TS535803815', 'TS35803815', 'TS5803815', '535803815'];
  for (const v of pnrVariants) {
    const [rows] = await seq.query(`SELECT id, pnr, numero_ticket, monto_pagado, monto_descuento FROM eventos WHERE pnr LIKE '%${v}%' OR numero_ticket LIKE '%${v}%'`);
    if (rows.length > 0) {
      console.log(`\n=== PNR variante "${v}" ENCONTRADO ===`);
      rows.forEach(r => console.log(JSON.stringify(r)));
    }
  }

  // 4. Todos los eventos con monto_pagado = 0 (todos los convenios)
  const [cero] = await seq.query(`
    SELECT e.id, e.tipo_evento, e.estado,
           e.numero_ticket, e.pnr,
           e.tarifa_base, e.monto_pagado, e.monto_descuento,
           e.tipo_pago, e.fecha_evento,
           e.convenio_id, c.nombre AS convenio_nombre,
           p.rut, p.nombres, p.apellidos
    FROM eventos e
    LEFT JOIN pasajeros  p   ON e.pasajero_id  = p.id
    LEFT JOIN convenios  c   ON e.convenio_id  = c.id
    WHERE e.monto_pagado = 0 AND e.tarifa_base > 0
    ORDER BY e.fecha_evento DESC
  `);
  console.log('\n=== TODOS los eventos con monto_pagado=0 y tarifa>0 ===', cero.length, 'encontrados');
  cero.forEach(ev => {
    console.log(`  ID=${ev.id} | pnr=${ev.pnr} | ticket=${ev.numero_ticket}`);
    console.log(`  ${ev.rut} — ${ev.nombres} ${ev.apellidos}`);
    console.log(`  convenio: ${ev.convenio_nombre}`);
    console.log(`  tarifa=$${ev.tarifa_base} | pagado=$${ev.monto_pagado} | desc=$${ev.monto_descuento} | estado=${ev.estado}`);
    console.log(`  fecha: ${ev.fecha_evento}`);
    console.log('');
  });

  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
