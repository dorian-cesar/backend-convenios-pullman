const { Evento, InvalidacionLog, Convenio } = require('./src/models');
const { Op } = require('sequelize');

async function recoverEvents() {
    const db = require('./src/models');
    try {
        await db.sequelize.authenticate();
        console.log("Connected to DB");

        // Buscar logs de invalidación recientes por "Error de Validación"
        const logs = await db.InvalidacionLog.findAll({
            where: {
                error_mensaje: 'Error de Validación',
                // fecha: { [Op.gte]: new Date('2026-09-09') } // últimos días
            },
            raw: true
        });

        console.log(`Se encontraron ${logs.length} registros en InvalidacionLog con 'Error de Validación'.`);

        let recoveredCount = 0;
        let alreadyExistsCount = 0;

        for (const log of logs) {
            let payload = log.payload;
            
            // A veces el payload es string, a veces JSON. Parsear si es necesario
            if (typeof payload === 'string') {
                try { payload = JSON.parse(payload); } catch (e) {}
            }

            if (!payload || !payload.pnr) {
                console.log(`Log ID ${log.id} ignorado: No tiene PNR en el payload.`);
                continue;
            }

            // Verificar si el PNR ya existe en Evento
            const existe = await db.Evento.findOne({
                where: { pnr: payload.pnr },
                raw: true
            });

            if (existe) {
                alreadyExistsCount++;
                continue;
            }

            // Intentar insertarlo en Evento
            try {
                await db.Evento.create({
                    tipo_evento: 'COMPRA',
                    tipo_pago: payload.tipo_pago || 'debito',
                    pasajero_id: payload.pasajero_id,
                    empresa_id: payload.empresa_id,
                    convenio_id: payload.convenio_id,
                    ciudad_origen: payload.ciudad_origen,
                    ciudad_destino: payload.ciudad_destino,
                    fecha_viaje: payload.fecha_viaje,
                    hora_salida: payload.hora_salida,
                    numero_asiento: payload.numero_asiento,
                    numero_ticket: payload.numero_ticket,
                    pnr: payload.pnr,
                    terminal_origen: payload.terminal_origen,
                    terminal_destino: payload.terminal_destino,
                    tarifa_base: payload.tarifa_base || 0,
                    monto_pagado: payload.monto_pagado,
                    monto_descuento: payload.monto_descuento,
                    porcentaje_descuento_aplicado: payload.porcentaje_descuento_aplicado,
                    codigo_autorizacion: payload.codigo_autorizacion,
                    estado: payload.estado || 'confirmado',
                    token: payload.token,
                    origen_compra: payload.origen_compra || 'WEB',
                    fecha_compra: payload.fecha_compra || log.fecha,
                    respuesta_kupos: payload.respuesta_kupos || null
                });
                
                console.log(`✅ Evento recuperado e insertado: PNR ${payload.pnr}`);
                recoveredCount++;
            } catch (err) {
                console.error(`❌ Error al insertar PNR ${payload.pnr} del log ${log.id}:`, err.message);
            }
        }

        console.log("\nResumen:");
        console.log(`Total logs revisados: ${logs.length}`);
        console.log(`Ya existían en Eventos: ${alreadyExistsCount}`);
        console.log(`Recuperados exitosamente: ${recoveredCount}`);

    } catch (e) {
        console.error("Error general:", e);
    } finally {
        await db.sequelize.close();
    }
}

recoverEvents();
