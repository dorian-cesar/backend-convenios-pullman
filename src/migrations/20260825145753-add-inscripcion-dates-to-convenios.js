'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('convenios', 'inscripcion_activa', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Switch manual para habilitar/deshabilitar inscripcion publica'
    });

    await queryInterface.addColumn('convenios', 'fecha_inicio_inscripcion', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('convenios', 'fecha_fin_inscripcion', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('convenios', 'inscripcion_activa');
    await queryInterface.removeColumn('convenios', 'fecha_inicio_inscripcion');
    await queryInterface.removeColumn('convenios', 'fecha_fin_inscripcion');
  }
};
