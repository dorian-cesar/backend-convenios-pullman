'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('eventos', 'respuesta_kupos', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Guarda la respuesta íntegra del servidor externo (Kupos)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('eventos', 'respuesta_kupos');
  }
};
