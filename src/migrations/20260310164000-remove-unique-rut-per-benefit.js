'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const indexes = [
            'unique_rut_per_benefit',
            'unique_rut_per_beneficiary',
            'beneficios_rut_tipo_beneficio',
            'beneficios_rut_convenio_id',
            'beneficiarios_rut_convenio_id'
        ];

        for (const indexName of indexes) {
            try {
                await queryInterface.removeIndex('beneficiarios', indexName);
                console.log(`Successfully removed index: ${indexName}`);
            } catch (error) {
                console.log(`Index ${indexName} could not be removed (might not exist): ${error.message}`);
            }
        }
    },

    async down(queryInterface, Sequelize) {
        // En un rollback, restauramos el más restrictivo para seguridad si fuera necesario,
        // pero dado el requerimiento de permitir duplicados, el down es opcional o menos restrictivo.
        try {
            await queryInterface.addIndex('beneficiarios', ['rut', 'convenio_id'], {
                unique: true,
                name: 'beneficiarios_rut_convenio_id'
            });
        } catch (e) {}
    }
};
