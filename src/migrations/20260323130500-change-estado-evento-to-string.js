'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Cambiando la columna 'estado' de ENUM a STRING.
    // Los datos existentes (ej. 'confirmado', 'anulado', 'revertido')
    // se mantendrán intactos al convertirse dinámicamente a VARCHAR.
    await queryInterface.changeColumn('eventos', 'estado', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Al intentar hacer un rollback, la columna volverá a ser un ENUM.
    // Esto podría fallar si se guardaron strings distintos a los permitidos.
    await queryInterface.changeColumn('eventos', 'estado', {
      type: Sequelize.ENUM('confirmado', 'anulado', 'revertido'),
      allowNull: true,
    });
  }
};
