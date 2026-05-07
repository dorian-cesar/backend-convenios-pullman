require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  // Patrones de descuento en el convenio más afectado
  const [rows] = await seq.query(`
    SELECT
      porcentaje_descuento_aplicado,
      tarifa_base,
      monto_pagado,
      monto_descuento,
      (tarifa_base - monto_pagado) AS diferencia_real,
      COUNT(*) as cnt
    FROM eventos
    WHERE deletedAt IS NULL AND monto_pagado = monto_descuento AND convenio_id = 167
    GROUP BY porcentaje_descuento_aplicado, tarifa_base, monto_pagado, monto_descuento
    ORDER BY cnt DESC
  `);
  console.log('\n=== Patrones de descuento en convenio 167 ===');
  rows.forEach(r => {
    const pctReal = r.tarifa_base > 0
      ? ((r.tarifa_base - r.monto_pagado) / r.tarifa_base * 100).toFixed(1)
      : 'N/A';
    console.log(`  tarifa_base=${r.tarifa_base} | monto_pagado=${r.monto_pagado} | monto_descuento=${r.monto_descuento} | pct_guardado=${r.porcentaje_descuento_aplicado}% | pct_REAL=${pctReal}% | diferencia_real=${r.diferencia_real} | n=${r.cnt}`);
  });

  const [conv] = await seq.query('SELECT id, nombre, porcentaje_descuento, tope_monto_descuento, tipo, tipo_descuento, valor_descuento FROM convenios WHERE id = 167');
  console.log('\n=== Convenio 167 config ===');
  console.log(JSON.stringify(conv[0], null, 2));

  // Configuración del convenio 166
  const [conv2] = await seq.query('SELECT id, nombre, porcentaje_descuento, tope_monto_descuento, tipo, tipo_descuento, valor_descuento FROM convenios WHERE id = 166');
  console.log('\n=== Convenio 166 config ===');
  console.log(JSON.stringify(conv2[0], null, 2));

  // Convenios frecuentes afectados
  const [conv3] = await seq.query('SELECT id, nombre, porcentaje_descuento, tope_monto_descuento, tipo, tipo_descuento, valor_descuento FROM convenios WHERE id IN (177, 178)');
  console.log('\n=== Convenios Frecuentes afectados ===');
  conv3.forEach(c => console.log(JSON.stringify(c, null, 2)));

  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
