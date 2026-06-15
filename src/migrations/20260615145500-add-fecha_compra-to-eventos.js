'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('eventos', 'fecha_compra', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Fecha de compra enviada por el front'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('eventos', 'fecha_compra');
  }
};
