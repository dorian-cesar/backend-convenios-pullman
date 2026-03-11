'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('convenios', 'configuraciones', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'rutas',
      comment: 'Configuración global de precios y asientos para todas las rutas del convenio'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('convenios', 'configuraciones');
  }
};
