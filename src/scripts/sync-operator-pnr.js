require('dotenv').config();
const axios = require('axios');
const { Evento, sequelize } = require('../models');
const { Op } = require('sequelize');

// ID mínimo desde el que se procesan eventos (inclusive)
const DESDE_ID = 1940;

/**
 * Script para sincronización MASIVA del campo 'pnr' con el 'operator_pnr' de Kupos.
 * Procesa eventos desde el ID indicado en DESDE_ID hacia el más reciente.
 * Cubre todos los casos de PNR inválido: null, vacío, '0', o igual al numero_ticket.
 */
async function syncOperatorPNR() {
    if (!process.env.KUPOS_API_KEY || !process.env.KUPOS_API_URL) {
        console.error('[ERROR] KUPOS_API_KEY o KUPOS_API_URL no configurados en .env');
        process.exit(1);
    }

    try {
        console.log(`[INICIO] Sincronización MASIVA de PNRs desde ID ${DESDE_ID}...`);

        const eventos = await Evento.findAll({
            where: {
                id: { [Op.gte]: DESDE_ID },
                numero_ticket: { [Op.ne]: null },
                [Op.or]: [
                    { pnr: null },
                    { pnr: '' },
                    { pnr: '0' },
                    { pnr: { [Op.eq]: sequelize.col('numero_ticket') } }
                ]
            },
            order: [['id', 'ASC']]
        });

        if (eventos.length === 0) {
            console.log('[INFO] No hay registros pendientes de sincronización.');
            return;
        }

        console.log(`[INFO] Se encontraron ${eventos.length} registros para procesar.`);

        let actualizados = 0;
        let fallidos = 0;

        for (const evento of eventos) {
            const ticket = evento.numero_ticket;

            try {
                const response = await axios.get(process.env.KUPOS_API_URL, {
                    params: {
                        pnr_number: ticket,
                        api_key: process.env.KUPOS_API_KEY
                    },
                    timeout: 5000
                });

                const ticketDetails = response.data?.result?.ticket_details;

                if (ticketDetails && ticketDetails.length > 0) {
                    const operator_pnr = ticketDetails[0].operator_pnr;

                    if (operator_pnr) {
                        await evento.update({ pnr: operator_pnr });
                        console.log(`[EXITO] ID ${evento.id}: Ticket ${ticket} -> PNR: ${operator_pnr}`);
                        actualizados++;
                    } else {
                        console.warn(`[AVISO] ID ${evento.id}: No se encontró operator_pnr para ticket ${ticket}`);
                        fallidos++;
                    }
                } else {
                    console.error(`[ERROR] ID ${evento.id}: Ticket ${ticket} no encontrado en Kupos.`);
                    fallidos++;
                }

            } catch (err) {
                console.error(`[FALLO] ID ${evento.id} | Ticket ${ticket}: ${err.message}`);
                fallidos++;
            }
            
            // Pausa de seguridad (500ms) para proteger la API de Kupos
            await new Promise(res => setTimeout(res, 500));
        }

        console.log('\n[RESUMEN FINAL]');
        console.log(`- Rango procesado:          ID >= ${DESDE_ID}`);
        console.log(`- Total registros encontrados: ${eventos.length}`);
        console.log(`- Actualizados con éxito:   ${actualizados}`);
        console.log(`- Fallidos/No encontrados:  ${fallidos}`);
        console.log('[PROCESO COMPLETADO]');

    } catch (error) {
        console.error('[ERROR CRITICO]:', error);
    } finally {
        process.exit(0);
    }
}

syncOperatorPNR();
