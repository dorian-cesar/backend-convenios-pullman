'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('invalidacion_logs', {
      id: { 
        allowNull: false, 
        autoIncrement: true, 
        primaryKey: true, 
        type: Sequelize.INTEGER 
      },
      fecha: { 
        allowNull: false, 
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      endpoint: { 
        type: Sequelize.STRING(255), 
        allowNull: true 
      },
      metodo: { 
        type: Sequelize.STRING(20), 
        allowNull: true 
      },
      rut: { 
        type: Sequelize.STRING(50), 
        allowNull: true 
      },
      pnr: { 
        type: Sequelize.STRING(50), 
        allowNull: true 
      },
      numero_ticket: { 
        type: Sequelize.STRING(100), 
        allowNull: true 
      },
      error_mensaje: { 
        type: Sequelize.TEXT, 
        allowNull: true 
      },
      payload: { 
        type: Sequelize.JSON, 
        allowNull: true 
      },
      ip: { 
        type: Sequelize.STRING(50), 
        allowNull: true 
      },
      user_identifier: { 
        type: Sequelize.STRING(150), 
        allowNull: true 
      }
    });
  },
  down: async (queryInterface) => { 
    await queryInterface.dropTable('invalidacion_logs'); 
  }
};
