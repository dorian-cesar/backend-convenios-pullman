require('dotenv').config();
const { Evento, Convenio, Empresa } = require('../src/models');
const { Op } = require('sequelize');

async function verifyEventsIntegrity() {
    try {
        console.log('=== INICIANDO VERIFICACIÓN DE INTEGRIDAD DE EVENTOS ===');
        console.log('Buscando eventos que posean discrepancias entre empresa_id y convenio.empresa_id...');

        // 1. Contar total de eventos para contextualizar
        const totalEventos = await Evento.count();
        const eventosConConvenio = await Evento.count({
            where: {
                convenio_id: { [Op.ne]: null }
            }
        });

        console.log(`Total de Eventos en base de datos: ${totalEventos}`);
        console.log(`Eventos asociados a un Convenio: ${eventosConConvenio}`);

        // 2. Traer eventos con su relación de convenio (y la empresa del convenio)
        const eventos = await Evento.findAll({
            where: {
                convenio_id: { [Op.ne]: null }
            },
            include: [{
                model: Convenio,
                attributes: ['id', 'nombre', 'empresa_id'],
                include: [{
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre']
                }]
            }],
            attributes: ['id', 'empresa_id', 'convenio_id', 'tipo_evento', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        let discrepancias = 0;
        const detallesDiscrepancias = [];

        for (const evento of eventos) {
            if (!evento.Convenio) {
                console.warn(`[ADVERTENCIA] Evento ID: ${evento.id} tiene convenio_id: ${evento.convenio_id} pero el convenio no existe en la base de datos.`);
                discrepancias++;
                continue;
            }

            const convenioEmpresaId = evento.Convenio.empresa_id;
            const eventoEmpresaId = evento.empresa_id;

            if (eventoEmpresaId !== convenioEmpresaId) {
                discrepancias++;
                detallesDiscrepancias.push({
                    eventoId: evento.id,
                    tipo: evento.tipo_evento,
                    fecha: evento.createdAt,
                    eventoEmpresaId: eventoEmpresaId,
                    convenioId: evento.convenio_id,
                    convenioNombre: evento.Convenio.nombre,
                    convenioEmpresaId: convenioEmpresaId,
                    convenioEmpresaNombre: evento.Convenio.empresa ? evento.Convenio.empresa.nombre : 'Sin Nombre'
                });
            }
        }

        console.log('\n=== RESULTADOS DE LA VERIFICACIÓN ===');
        console.log(`Total discrepancias detectadas: ${discrepancias}`);

        if (discrepancias > 0) {
            console.log('\nDetalle de las primeras 50 discrepancias detectadas (para evitar sobrecargar la consola):');
            console.table(detallesDiscrepancias.slice(0, 50));
            if (detallesDiscrepancias.length > 50) {
                console.log(`... y ${detallesDiscrepancias.length - 50} discrepancias más.`);
            }
        } else {
            console.log('✅ ¡Felicidades! Todos los eventos asociados a convenios tienen una correspondencia perfecta de empresa_id.');
        }

    } catch (error) {
        console.error('❌ Error durante la verificación de integridad:', error);
    } finally {
        process.exit();
    }
}

verifyEventsIntegrity();
