require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));
async function main() {
  // Buscar por RUT 18398273-9 (Priscila Ariel Soto - Carabineros)
  const [rows] = await seq.query(`
    SELECT e.id, e.tipo_evento, e.estado,
           e.numero_ticket, e.pnr,
           e.tarifa_base, e.monto_pagado, e.monto_descuento,
           e.porcentaje_descuento_aplicado, e.tipo_pago, e.codigo_autorizacion,
           e.ciudad_origen, e.ciudad_destino, e.fecha_viaje, e.fecha_evento,
           e.convenio_id, c.nombre AS convenio_nombre,
           e.empresa_id, emp.nombre AS empresa_nombre,
           p.rut, p.nombres, p.apellidos,
           e.createdAt
    FROM eventos e
    LEFT JOIN pasajeros  p   ON e.pasajero_id  = p.id
    LEFT JOIN empresas   emp ON e.empresa_id   = emp.id
    LEFT JOIN convenios  c   ON e.convenio_id  = c.id
    WHERE p.rut = '18398273-9'
    ORDER BY e.id ASC
  `);
  console.log('Eventos de RUT 18398273-9 (Priscila Ariel Soto):', rows.length);
  rows.forEach(ev => {
    const base   = Number(ev.tarifa_base)     || 0;
    const pagado = Number(ev.monto_pagado)    || 0;
    const desc   = Number(ev.monto_descuento) || 0;
    const pctReal = base > 0 ? ((base - pagado) / base * 100).toFixed(1) + '%' : 'N/A';
    console.log('─'.repeat(60));
    console.log(`ID=${ev.id} | ${ev.tipo_evento} | ${ev.estado}`);
    console.log(`ticket: ${ev.numero_ticket} | pnr: ${ev.pnr}`);
    console.log(`convenio: ${ev.convenio_nombre}`);
    console.log(`empresa: ${ev.empresa_nombre}`);
    console.log(`ruta: ${ev.ciudad_origen} → ${ev.ciudad_destino} | viaje: ${ev.fecha_viaje}`);
    console.log(`tarifa_base: $${base.toLocaleString('es-CL')} | pagado: $${pagado.toLocaleString('es-CL')} | descuento: $${desc.toLocaleString('es-CL')}`);
    console.log(`% descuento REAL: ${pctReal} | pct guardado: ${ev.porcentaje_descuento_aplicado}%`);
    console.log(`tipo_pago: ${ev.tipo_pago} | cod_auth: ${ev.codigo_autorizacion}`);
    console.log(`fecha_evento: ${ev.fecha_evento}`);
    if (pagado === 0 && base > 0) {
      console.log(`🔴 monto_pagado=0 con tarifa=$${base.toLocaleString('es-CL')} → DESCUENTO 100% REAL`);
    }
  });
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
