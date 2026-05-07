require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function auditAndReport() {
    console.log("🔍 BUSCANDO REGISTROS DAÑADOS (monto_pagado = 0 con convenio)...");

    const [rows] = await seq.query(`
        SELECT 
            e.id, e.tarifa_base, e.monto_pagado, e.monto_descuento, 
            c.nombre as convenio_nombre, c.tipo_descuento, c.valor_descuento, c.id as convenio_id
        FROM eventos e
        JOIN convenios c ON e.convenio_id = c.id
        WHERE e.monto_pagado = 0 AND e.tarifa_base > 0 AND e.estado = 'confirmado'
        ORDER BY e.fecha_evento DESC
    `);

    console.log(`\nSe encontraron ${rows.length} registros con posible daño.\n`);
    
    let totalPerdido = 0;
    const propuestas = [];

    for (const r of rows) {
        const base = Number(r.tarifa_base);
        const valor = Number(r.valor_descuento);
        let dCalculado = 0;
        let pEsperado = 0;

        if (r.tipo_descuento === 'Porcentaje') {
            dCalculado = Math.round(base * (valor / 100));
            pEsperado = base - dCalculado;
        } else if (r.tipo_descuento === 'Monto Fijo') {
            dCalculado = valor;
            pEsperado = Math.max(0, base - valor);
        } else if (r.tipo_descuento === 'Tarifa Plana') {
            pEsperado = valor;
            dCalculado = Math.max(0, base - valor);
        }

        totalPerdido += pEsperado;
        propuestas.push({
            id: r.id,
            convenio: r.convenio_nombre,
            tarifa: base,
            pago_actual: 0,
            pago_correcto: pEsperado,
            descuento_correcto: dCalculado
        });
    }

    console.table(propuestas.slice(0, 20)); // Mostrar los primeros 20
    if (propuestas.length > 20) console.log(`... y ${propuestas.length - 20} más.`);

    console.log(`\n💰 TOTAL DE DINERO NO PERCIBIDO EN ESTOS REGISTROS: $${totalPerdido.toLocaleString('es-CL')}`);
    console.log("\n¿Quieres que proceda a aplicar estos cambios en la base de datos de producción?");
    
    process.exit(0);
}

auditAndReport();
