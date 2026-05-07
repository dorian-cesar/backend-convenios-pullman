require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function fix() {
    console.log("🚀 INICIANDO REPARACIÓN DE REGISTROS #2860 y #6074...");

    try {
        // 1. Reparar #6074 (La Araucana: 10% de 7000)
        // Pago esperado: 6300, Descuento: 700
        const [res1] = await seq.query(`
            UPDATE eventos 
            SET monto_pagado = 6300, monto_descuento = 700 
            WHERE id = 6074 AND monto_pagado = 0
        `);
        console.log(`✅ Registro #6074 reparado: ${res1.affectedRows} filas afectadas.`);

        // 2. Reparar #2860 (Los Andes: 10% de 22000)
        // Pago esperado: 19800, Descuento: 2200
        const [res2] = await seq.query(`
            UPDATE eventos 
            SET monto_pagado = 19800, monto_descuento = 2200 
            WHERE id = 2860 AND monto_pagado = 0
        `);
        console.log(`✅ Registro #2860 reparado: ${res2.affectedRows} filas afectadas.`);

    } catch (e) {
        console.error("❌ ERROR DURANTE LA REPARACIÓN:", e.message);
    }

    process.exit(0);
}

fix();
