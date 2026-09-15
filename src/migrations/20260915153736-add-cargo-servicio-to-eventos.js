'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('eventos', 'cargo_servicio', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Cargo por servicio sumado a la tarifa base'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('eventos', 'cargo_servicio');
  }
};
