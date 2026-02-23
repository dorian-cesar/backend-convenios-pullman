const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

const db = require('../src/models');
const { Evento, Convenio } = db;

async function migrateConsumption() {
    try {
        console.log('Starting migration of Convenio consumption counters...');
        await db.sequelize.authenticate();

        // Sync to ensure columns exist
        await Convenio.sync({ alter: true });

        const convenios = await Convenio.findAll();
        console.log(`Found ${convenios.length} conventions.`);

        for (const convenio of convenios) {
            console.log(`Processing Convenio ID: ${convenio.id} (${convenio.nombre})...`);

            // 1. Get confirmed purchases
            const compras = await Evento.findAll({
                attributes: ['id', 'tarifa_base', 'monto_pagado'],
                where: {
                    convenio_id: convenio.id,
                    tipo_evento: 'COMPRA',
                    estado: 'confirmado'
                },
                raw: true
            });

            // 2. Get refunds (to exclude refunded purchases)
            // Strategy: If a purchase is fully refunded, it shouldn't count.
            // We look for DEVOLUCION events that point to these purchases.
            const devoluciones = await Evento.findAll({
                attributes: ['evento_origen_id'],
                where: {
                    convenio_id: convenio.id,
                    tipo_evento: 'DEVOLUCION',
                    estado: 'confirmado' // Only confirmed refunds? Or all? Let's say confirmed.
                },
                raw: true
            });

            const idsDevueltos = new Set(devoluciones.map(d => d.evento_origen_id));

            let consumoTickets = 0;
            let consumoMonto = 0;

            compras.forEach(compra => {
                // Only count if NOT refunded
                if (!idsDevueltos.has(compra.id)) {
                    consumoTickets++;
                    const pagado = compra.monto_pagado !== null ? compra.monto_pagado : 0;
                    const descuento = (compra.tarifa_base || 0) - pagado;
                    consumoMonto += descuento;
                }
            });

            console.log(`  -> Calculated: Tickets=${consumoTickets}, Monto=${consumoMonto}`);

            // Update Convenio
            convenio.consumo_tickets = consumoTickets;
            convenio.consumo_monto = consumoMonto;
            await convenio.save();
        }

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrateConsumption();
