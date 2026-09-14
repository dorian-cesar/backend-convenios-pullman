'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Añadir columnas a convenios
    await queryInterface.addColumn('convenios', 'is_destacado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.addColumn('convenios', 'descripcion_destacado', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('convenios', 'logo_destacado', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('convenios', 'orden_destacado', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // 2. Crear tabla configuraciones
    await queryInterface.createTable('configuraciones', {
      clave: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      valor: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir configuraciones
    await queryInterface.dropTable('configuraciones');

    // Revertir columnas de convenios
    await queryInterface.removeColumn('convenios', 'orden_destacado');
    await queryInterface.removeColumn('convenios', 'logo_destacado');
    await queryInterface.removeColumn('convenios', 'descripcion_destacado');
    await queryInterface.removeColumn('convenios', 'is_destacado');
  }
};
