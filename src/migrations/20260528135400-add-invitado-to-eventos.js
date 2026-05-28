'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('eventos', 'invitado', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'true = familiar/acompañante (no es beneficiario directo del convenio), false = beneficiario directo'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('eventos', 'invitado');
  }
};
