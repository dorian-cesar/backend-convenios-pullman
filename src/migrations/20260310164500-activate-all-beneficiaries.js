'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Set all existing beneficiaries to 'ACTIVO'
    await queryInterface.bulkUpdate('beneficiarios', { status: 'ACTIVO' }, {});
  },

  async down(queryInterface, Sequelize) {
    // No easy way to revert this without knowing old statuses, 
    // but we can set them to 'INACTIVO' as a default rollback.
    await queryInterface.bulkUpdate('beneficiarios', { status: 'INACTIVO' }, {});
  }
};
