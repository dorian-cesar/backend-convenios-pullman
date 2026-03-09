'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('beneficios', 'beneficiarios');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('beneficiarios', 'beneficios');
  }
};
