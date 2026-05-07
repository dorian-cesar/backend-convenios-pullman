require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  // Buscar tablas relacionadas con api_consulta_id
  const [tablas] = await seq.query(`SHOW TABLES`);
  const nombres = tablas.map(t => Object.values(t)[0]);
  console.log('Todas las tablas:', nombres.join(', '));

  // Buscar tabla que tenga "api" o "consulta" en nombre
  const apiTablas = nombres.filter(n => n.includes('api') || n.includes('consulta') || n.includes('endpoint'));
  console.log('\nTablas con api/consulta/endpoint:', apiTablas);

  // Ver qué contiene api_consulta_id=29 — buscar en convenio_beneficiarios o tabla de endpoints
  // Intentar diferentes nombres posibles
  const candidates = ['convenio_apis', 'apis_consulta', 'beneficiarios_api', 'api_convenios', 'convenio_endpoints'];
  for (const t of candidates) {
    if (nombres.includes(t)) {
      const [rows] = await seq.query(`SELECT * FROM ${t} WHERE id = 29`);
      console.log(`\nEn ${t} ID=29:`, JSON.stringify(rows));
    }
  }

  // Revisar la tabla integracionBeneficiarios o beneficiario_config
  // Buscar el endpoint que usa el convenio FACh
  // El campo api_consulta_id del convenio apunta a alguna tabla de configuración
  // Buscar en clientes_corporativos_fach_nomina: ¿cuántos hay? ¿qué estructura?
  const [nomina] = await seq.query(`SELECT COUNT(*) as total FROM clientes_corporativos_fach_nomina`);
  console.log('\nTotal en clientes_corporativos_fach_nomina:', nomina[0].total);

  const [sample] = await seq.query(`SELECT * FROM clientes_corporativos_fach_nomina LIMIT 3`);
  console.log('Muestra de registros:', JSON.stringify(sample, null, 2));

  // Buscar el pasajero ID 8830 (anita mancilla) en la nómina
  const [enNomina] = await seq.query(`SELECT * FROM clientes_corporativos_fach_nomina WHERE rut = '19027493-4'`);
  console.log('\nRUT 19027493-4 en nomina FACh:', enNomina.length > 0 ? JSON.stringify(enNomina) : '❌ NO ENCONTRADO');

  // Ver cuántos de los 14 eventos confirmados tienen pasajero NO en nómina
  const [eventosFach] = await seq.query(`
    SELECT e.id, e.estado, p.rut, p.nombres, p.apellidos, e.fecha_evento,
           e.monto_pagado, e.tarifa_base
    FROM eventos e
    LEFT JOIN pasajeros p ON e.pasajero_id = p.id
    WHERE e.convenio_id = 188
    ORDER BY e.fecha_evento DESC
  `);
  console.log('\n── Los 14 eventos confirmados del convenio FACh ────────────────');
  const ruts = [];
  eventosFach.forEach(ev => {
    ruts.push(ev.rut);
    console.log(`  ID=${ev.id} | ${ev.estado} | RUT=${ev.rut} | ${ev.nombres} ${ev.apellidos} | pagado=$${Number(ev.monto_pagado).toLocaleString('es-CL')} | ${ev.fecha_evento?.toString().substring(0,10)}`);
  });

  // Verificar cuáles de esos RUTs están en nómina
  console.log('\n── Verificando qué RUTs de eventos FACh están en nómina ────────');
  const rutsUnicos = [...new Set(ruts.filter(Boolean))];
  for (const rut of rutsUnicos) {
    const [enN] = await seq.query(`SELECT rut FROM clientes_corporativos_fach_nomina WHERE rut = '${rut}'`);
    console.log(`  ${rut}: ${enN.length > 0 ? '✅ EN NOMINA' : '❌ NO EN NOMINA'}`);
  }

  process.exit(0);
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
