require('dotenv').config();
const { Evento, Convenio, sequelize } = require('../src/models');
const { Op } = require('sequelize');

async function runBackfill() {
    const isDryRun = process.env.CONFIRM !== 'true';
    const BATCH_SIZE = 200; // Configurado a 200 registros a solicitud del usuario

    console.log('=== INICIANDO BACKFILL DE EMERGENCIA DE EVENTOS ===');
    console.log(`Modo: ${isDryRun ? '🔍 SIMULACIÓN (Dry Run)' : '⚡ REAL (Se aplicarán cambios en BD)'}`);
    console.log(`Tamaño de lote: ${BATCH_SIZE} registros por bloque.\n`);

    try {
        // 1. Encontrar todos los eventos que difieren de la empresa del convenio
        console.log('Buscando discrepancias en la base de datos...');
        const eventosConInconsistencias = await Evento.findAll({
            where: {
                convenio_id: { [Op.ne]: null }
            },
            include: [{
                model: Convenio,
                attributes: ['id', 'empresa_id']
            }],
            attributes: ['id', 'empresa_id', 'convenio_id']
        });

        const paraCorregir = [];
        for (const ev of eventosConInconsistencias) {
            if (ev.Convenio && ev.empresa_id !== ev.Convenio.empresa_id) {
                paraCorregir.push({
                    id: ev.id,
                    empresaIncorrecta: ev.empresa_id,
                    empresaCorrecta: ev.Convenio.empresa_id
                });
            }
        }

        console.log(`Registros totales identificados con discrepancias: ${paraCorregir.length}`);

        if (paraCorregir.length === 0) {
            console.log('✅ No hay discrepancias que corregir. ¡Base de datos limpia!');
            return;
        }

        if (isDryRun) {
            console.log('\n--- VISTA PREVIA (MUESTRA DE LOS PRIMEROS 5 REGISTROS) ---');
            console.table(paraCorregir.slice(0, 5));
            console.log('\n> [TIP] Para ejecutar los cambios reales en producción de 200 en 200, corre el comando de la siguiente manera:');
            console.log('  $env:CONFIRM="true"; node scripts/backfill_events_empresa.js');
            return;
        }

        console.log('\n⚡ Iniciando actualización por lotes de 200 en 200...');
        let procesados = 0;
        let exitosos = 0;

        while (procesados < paraCorregir.length) {
            const lote = paraCorregir.slice(procesados, procesados + BATCH_SIZE);
            
            // Usamos transacciones individuales por lote para máxima seguridad
            const t = await sequelize.transaction();
            try {
                for (const item of lote) {
                    await Evento.update(
                        { empresa_id: item.empresaCorrecta },
                        { where: { id: item.id }, transaction: t }
                    );
                }
                await t.commit();
                exitosos += lote.length;
                console.log(`  Progreso: [${exitosos}/${paraCorregir.length}] registros corregidos con éxito.`);
            } catch (err) {
                await t.rollback();
                console.error(`❌ Error en lote que inicia en registro #${procesados}:`, err.message);
                console.warn('Abortando ejecución para proteger la base de datos.');
                break;
            }

            procesados += BATCH_SIZE;
            // Pausa de 100ms entre lotes para aliviar la base de datos y evitar sobrecargas
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`\n=== PROCESO COMPLETADO ===`);
        console.log(`Registros procesados: ${procesados}`);
        console.log(`Registros actualizados exitosamente: ${exitosos}`);

    } catch (error) {
        console.error('❌ Error general durante el backfill:', error);
    } finally {
        process.exit();
    }
}

runBackfill();
