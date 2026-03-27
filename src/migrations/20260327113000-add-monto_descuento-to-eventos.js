'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('eventos', 'monto_descuento', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'monto_pagado'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('eventos', 'monto_descuento');
  }
};
