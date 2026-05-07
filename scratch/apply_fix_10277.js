require('dotenv').config();
const path = require('path');
const seq = require(path.join(process.cwd(), 'src', 'config', 'sequelize'));

async function fix() {
    console.log("🚀 REPARANDO ÚLTIMO REGISTRO DAÑADO: #10277 (Carabineros)...");

    try {
        // Reparar #10277 (Carabineros: 15% de 38000)
        // Pago esperado: 32300, Descuento: 5700
        const [res] = await seq.query(`
            UPDATE eventos 
            SET monto_pagado = 32300, monto_descuento = 5700 
            WHERE id = 10277 AND monto_pagado = 0
        `);
        console.log(`✅ Registro #10277 reparado: ${res.affectedRows} filas afectadas.`);

    } catch (e) {
        console.error("❌ ERROR DURANTE LA REPARACIÓN:", e.message);
    }

    process.exit(0);
}

fix();
