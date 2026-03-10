'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Eliminar el índice único que está causando el error VALIDATION_ERROR en la tabla beneficios
        await queryInterface.removeIndex('beneficios', 'unique_rut_per_benefit');
    },

    async down(queryInterface, Sequelize) {
        // Restaurar el índice en caso de rollback
        await queryInterface.addIndex('beneficios', ['rut', 'tipo_beneficio'], {
            unique: true,
            name: 'unique_rut_per_benefit'
        });
    }
};
