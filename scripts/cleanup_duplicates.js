const { sequelize, Convenio, Descuento } = require('../src/models');

async function cleanupDuplicates() {
    try {
        console.log('🧹 Iniciando limpieza de descuentos duplicados...');
        await sequelize.authenticate();

        // 1. Buscar todos los convenios con descuentos activos
        const convenios = await Convenio.findAll({
            include: [{
                model: Descuento,
                as: 'descuentos',
                where: { status: 'ACTIVO' }
            }]
        });

        for (const convenio of convenios) {
            const activeDiscounts = convenio.descuentos;

            if (activeDiscounts.length > 1) {
                console.log(`⚠️ Convenio ID ${convenio.id} ("${convenio.nombre}") tiene ${activeDiscounts.length} descuentos activos.`);

                // Estrategia: Mantener el más reciente (mayor ID) y desactivar el resto
                // O mantener el que tenga mayor porcentaje?
                // El usuario mencionó ID 1 tiene descuentos viejos.
                // Vamos a mantener el ÚLTIMO creado (mayor ID).

                activeDiscounts.sort((a, b) => b.id - a.id);
                const winner = activeDiscounts[0];
                const losers = activeDiscounts.slice(1);

                console.log(`   ✅ Manteniendo Descuento ID ${winner.id} (${winner.porcentaje_descuento}%)`);

                for (const loser of losers) {
                    console.log(`   ❌ Desactivando Descuento ID ${loser.id} (${loser.porcentaje_descuento}%)`);
                    loser.status = 'INACTIVO';
                    await loser.save();
                }
            }
        }

        console.log('✨ Limpieza completada.');
    } catch (error) {
        console.error('❌ Error en limpieza:', error);
    } finally {
        process.exit();
    }
}

cleanupDuplicates();
