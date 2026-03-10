'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addIndex('beneficiarios', ['rut', 'convenio_id'], {
        unique: true,
        name: 'beneficiarios_rut_convenio_unique'
      });
      console.log('Successfully added composite unique index: beneficiarios_rut_convenio_unique');
    } catch (error) {
      console.error('Error adding composite index:', error.message);
      // If it exists, we don't fail the migration
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('beneficiarios', 'beneficiarios_rut_convenio_unique');
  }
};
