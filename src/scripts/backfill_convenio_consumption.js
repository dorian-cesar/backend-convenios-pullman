
process.env.TZ = 'America/Santiago';
require('dotenv').config();
const { sequelize, Convenio, Evento } = require('../models');
const { Op } = require('sequelize');

async function runBackfill() {
    try {
        console.log('--- Iniciando Backfill de Consumo de Convenios ---');
        await sequelize.authenticate();
        console.log('Conexión exitosa.');

        const convenios = await Convenio.findAll();
        console.log(`Procesando ${convenios.length} convenios...`);

        for (const convenio of convenios) {
            console.log(`\nConvenio: [${convenio.id}] ${convenio.nombre}`);

            // 1. Contar Tickets (Eventos COMPRA confirmados - Eventos DEVOLUCION confirmados)
            // Nota: En este sistema, un evento de compra tiene status 'REALIZADO' o similar? 
            // Revisando lógica de eventos.service: se incrementa en crearCompraEvento (confirmado) y decrementa en crearDevolucionEvento (confirmado).

            const compras = await Evento.count({
                where: {
                    convenio_id: convenio.id,
                    tipo_evento: 'COMPRA',
                    status: 'CONFIRMADO' // Basado en la lógica de eventos.service.js
                }
            });

            const devoluciones = await Evento.count({
                where: {
                    convenio_id: convenio.id,
                    tipo_evento: 'DEVOLUCION',
                    status: 'CONFIRMADO'
                }
            });

            const totalTickets = Math.max(0, compras - devoluciones);

            // 2. Sumar Montos
            // El descuento se calcula como (tarifa_base - monto_pagado)
            const eventosCompra = await Evento.findAll({
                where: {
                    convenio_id: convenio.id,
                    tipo_evento: 'COMPRA',
                    status: 'CONFIRMADO'
                }
            });

            let totalMontoDescuento = 0;
            eventosCompra.forEach(e => {
                const descuento = (e.tarifa_base || 0) - (e.monto_pagado || 0);
                totalMontoDescuento += Math.max(0, descuento);
            });

            const eventosDevolucion = await Evento.findAll({
                where: {
                    convenio_id: convenio.id,
                    tipo_evento: 'DEVOLUCION',
                    status: 'CONFIRMADO'
                }
            });

            eventosDevolucion.forEach(e => {
                const descuento = (e.tarifa_base || 0) - (e.monto_pagado || 0);
                totalMontoDescuento -= Math.max(0, descuento);
            });

            totalMontoDescuento = Math.max(0, totalMontoDescuento);

            console.log(`  Tickets: ${compras} (C) - ${devoluciones} (D) = ${totalTickets}`);
            console.log(`  Monto: $${totalMontoDescuento}`);

            // 3. Actualizar Convenio
            await convenio.update({
                consumo_tickets: totalTickets,
                consumo_monto_descuento: totalMontoDescuento
            });
            console.log('  ✅ Actualizado.');
        }

        console.log('\n--- Backfill completado con éxito ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el backfill:', error);
        process.exit(1);
    }
}

runBackfill();
