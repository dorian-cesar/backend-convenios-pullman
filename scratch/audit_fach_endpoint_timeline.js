// Simula exactamente lo que hace el frontend cuando llama a /api/convenios?status=ACTIVO
// y verifica qué endpoint recibe para el convenio FACh [188]
require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  INVESTIGACIÓN: ¿Qué endpoint recibe el frontend para FACh? ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // 1. Lo que devuelve el backend al listar convenios (incluye apiConsulta)
  const [conv] = await seq.query(`
    SELECT c.id, c.nombre, c.tipo, c.api_consulta_id, c.beneficio,
           a.id as api_id, a.endpoint as api_endpoint, a.nombre as api_nombre
    FROM convenios c
    LEFT JOIN apis_consulta a ON c.api_consulta_id = a.id
    WHERE c.id = 188
  `);
  
  console.log('── Convenio FACh con su apiConsulta ────────────────────────────');
  conv.forEach(c => {
    console.log(`  id: ${c.id} | nombre: ${c.nombre}`);
    console.log(`  tipo: ${c.tipo} | beneficio: ${c.beneficio}`);
    console.log(`  api_consulta_id: ${c.api_consulta_id}`);
    console.log(`  api_id: ${c.api_id} | api_nombre: ${c.api_nombre}`);
    console.log(`  api_endpoint: ${c.api_endpoint}`);

    // Simular el ConvenioDTO
    const beneficio = !!c.beneficio;
    const tipo_consulta = c.tipo;
    let endpoint;
    if (beneficio) {
      endpoint = '/api/integraciones/beneficiarios/validar';
    } else if (tipo_consulta === 'CODIGO_DESCUENTO') {
      endpoint = '/api/convenios/validar/{codigo}';
    } else {
      // Si es API_EXTERNA → tomar de apiConsulta
      endpoint = c.api_endpoint || null;
    }

    console.log(`\n  ── Endpoint calculado por ConvenioDTO: "${endpoint}"`);
    
    if (endpoint) {
      console.log('  ✅ El frontend RECIBIRÁ un endpoint válido');
    } else {
      console.log('  ❌ El frontend RECIBIRÁ endpoint = null → no puede validar');
    }
  });

  // 2. Ver el endpoint completo del frontend validar/route.ts
  // El frontend llama al backend con ese endpoint relativo
  // El backend URL es NEXT_PUBLIC_BACKEND_INT_URL + endpoint
  // Resultado: algo como https://backend.com/api/tablas-clientes-corporativos/validar/fach_nomina
  console.log('\n── Flujo completo de validación si endpoint es correcto ─────────');
  console.log('  Frontend → POST /api/integracion/convenios/validar');
  console.log('  Frontend route.ts → fetch(backendUrl + convenio.endpoint, { rut })');
  console.log('  Backend endpoint: /api/tablas-clientes-corporativos/validar/fach_nomina');
  console.log('  Backend controller: clienteCorporativoTablaEmpresa.controller.validar');
  console.log('  Backend service: validarRut("fach_nomina", rut)');
  console.log('  Si RUT no está en clientes_corporativos_fach_nomina → 404 → RECHAZADO');

  // 3. Pero ¿el route.ts del frontend maneja correctamente un 404?
  // Revisemos: result.afiliado === true || result.status === "ACTIVO"
  // Un 404 devolvería { message: "Cliente corporativo no encontrado" } sin afiliado ni status
  // → esValido = false → el frontend NO debería haber dejado pasar al usuario
  console.log('\n── ¿Qué pasa en frontend si el backend devuelve 404? ────────────');
  console.log('  route.ts línea 290: esValido = result.afiliado === true || result.status === "ACTIVO"');
  console.log('  Si backend devuelve 404 con { message: "..." } → afiliado=undefined, status=undefined');
  console.log('  → esValido = false → frontend devuelve { success: true, valido: false }');
  console.log('  → step-validation.tsx: setError(...) → USUARIO NO PUEDE CONTINUAR');
  console.log('\n  ⚠️  Entonces si el endpoint es correcto, el frontend SÍ debería rechazar...');
  console.log('  ⚠️  ¿Qué pasó el día de la compra? ¿El endpoint estaba null?');

  // 4. Revisar si el convenio 188 SIEMPRE tuvo api_consulta_id = 29
  // o si fue añadido después de las compras fraudulentas
  const [historial] = await seq.query(`
    SELECT id, nombre, api_consulta_id, createdAt, updatedAt
    FROM convenios WHERE id = 188
  `);
  console.log('\n── Historial del convenio 188 ───────────────────────────────────');
  historial.forEach(h => {
    console.log(`  createdAt: ${h.createdAt} | updatedAt: ${h.updatedAt}`);
    console.log(`  api_consulta_id actual: ${h.api_consulta_id}`);
  });

  // 5. Fecha de creación del api_consulta 29
  const [apiInfo] = await seq.query(`SELECT * FROM apis_consulta WHERE id = 29`);
  console.log('\n── Fechas del api_consulta ID=29 ────────────────────────────────');
  apiInfo.forEach(a => {
    console.log(`  createdAt: ${a.createdAt} | updatedAt: ${a.updatedAt}`);
    console.log(`  endpoint: ${a.endpoint}`);
  });

  // 6. Fechas de los eventos fraudulentos vs fecha de creación de la api_consulta
  const [eventos] = await seq.query(`
    SELECT id, estado, fecha_evento, createdAt
    FROM eventos WHERE convenio_id = 188
    ORDER BY createdAt ASC
  `);
  console.log('\n── Fechas de TODOS los eventos del convenio FACh ────────────────');
  eventos.forEach(e => {
    console.log(`  ID=${e.id} | ${e.estado} | createdAt: ${e.createdAt?.toString().substring(0,19)}`);
  });

  process.exit(0);
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
