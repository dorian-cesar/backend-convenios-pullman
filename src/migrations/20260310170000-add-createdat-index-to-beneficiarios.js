'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('beneficiarios', ['createdAt'], {
      name: 'beneficiarios_created_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('beneficiarios', 'beneficiarios_created_at_idx');
  }
};
