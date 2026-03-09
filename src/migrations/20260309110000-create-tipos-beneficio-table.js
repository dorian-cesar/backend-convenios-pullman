'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tipos_beneficio', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Identificador único (ej: ESTUDIANTE, CARABINERO)'
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre legible (ej: Estudiante Regular)'
      },
      api_consulta_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'apis_consulta',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      api_registro_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'api_registros',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      configuracion_imagenes: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Listado de imágenes requeridas y sus labels'
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'ACTIVO'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('tipos_beneficio', ['slug']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tipos_beneficio');
  }
};
