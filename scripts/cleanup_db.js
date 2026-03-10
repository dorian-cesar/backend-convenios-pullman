const { Empresa, Convenio, ApiConsulta, apiRegistro, Beneficiario, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function cleanup() {
    try {
        const conveniosToKeep = [181, 182, 183, 184, 185];
        const empresasToKeep = [1, 3, 6, 7, 8];

        console.log('--- Iniciando Limpieza ---');

        // 1. Borrar Convenios (no preservados)
        const deletedConvenios = await Convenio.destroy({
            where: {
                id: { [Op.notIn]: conveniosToKeep }
            },
            force: true // Asegurar borrado físico si es paranoid
        });
        console.log(`Convenios eliminados: ${deletedConvenios}`);

        // 2. Borrar Empresas (no preservadas)
        // Nota: Esto fallará si hay convenios activos asociados a estas empresas que no borramos.
        // Pero como conveniosToKeep están asociados a empresasToKeep, debería estar bien.
        const deletedEmpresas = await Empresa.destroy({
            where: {
                id: { [Op.notIn]: empresasToKeep }
            },
            force: true
        });
        console.log(`Empresas eliminadas: ${deletedEmpresas}`);

        // 3. Opcional: Borrar beneficiarios que no pertenecen a los convenios preservados
        const deletedBeneficiarios = await Beneficiario.destroy({
            where: {
                convenio_id: { [Op.notIn]: conveniosToKeep }
            },
            force: true
        });
        console.log(`Beneficiarios eliminados: ${deletedBeneficiarios}`);

        console.log('--- Limpieza completada ---');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la limpieza:', error);
        process.exit(1);
    }
}

cleanup();
