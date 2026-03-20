const { Sequelize } = require('sequelize');
const { Beneficiario } = require('../src/models');

async function cleanDuplicates() {
    console.log('Iniciando limpieza de beneficiarios duplicados...');
    try {
        // Encontrar duplicados
        const duplicados = await Beneficiario.findAll({
            attributes: ['rut', 'convenio_id', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            group: ['rut', 'convenio_id'],
            having: Sequelize.literal('count > 1'),
            raw: true
        });

        if (duplicados.length === 0) {
            console.log('No se encontraron beneficiarios duplicados.');
            return;
        }

        console.log(`Se encontraron ${duplicados.length} combinaciones de RUT y Convenio duplicadas.`);

        for (const dup of duplicados) {
            console.log(`Procesando RUT: ${dup.rut}, Convenio ID: ${dup.convenio_id}`);
            
            // Obtener todos los registros para esta combinación, ordenados por ID desc (para mantener el más reciente)
            const registros = await Beneficiario.findAll({
                where: {
                    rut: dup.rut,
                    convenio_id: dup.convenio_id
                },
                order: [['id', 'DESC']]
            });

            // Mantener el primer registro (el más reciente) y eliminar el resto
            const [aMantener, ...aEliminar] = registros;
            
            console.log(`  -> Manteniendo registro ID: ${aMantener.id}`);
            
            for (const registro of aEliminar) {
                console.log(`  -> Eliminando registro ID: ${registro.id} (Registro duplicado)`);
                // Forzamos eliminación "hard" (force: true) para que desaparezca completamente
                // y no cause problemas con el índice único incluso con soft deletes
                await registro.destroy({ force: true });
            }
        }

        console.log('Limpieza completada exitosamente.');
        console.log('\nIMPORTANTE: Ahora debes asegurarte de que el índice único esté aplicado en la base de datos.');
        console.log('Puedes correr la siguiente query manualmente en tu BD si la migración falló previamente:');
        console.log('CREATE UNIQUE INDEX beneficiarios_rut_convenio_unique ON beneficiarios (rut, convenio_id);');

    } catch (error) {
        console.error('Error durante la limpieza:', error);
    }
}

cleanDuplicates().then(() => process.exit(0));
