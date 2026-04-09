'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('registro_tablas_clientes_corporativos', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nombre_tabla: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      nombre_display: { type: Sequelize.STRING(150), allowNull: false },
      empresa_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'empresas', key: 'id' } },
      convenio_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'convenios', key: 'id' } },
      api_consulta_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'apis_consulta', key: 'id' } },
      status: { type: Sequelize.STRING(20), defaultValue: 'ACTIVO' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
      deletedAt: { type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('registro_tablas_clientes_corporativos'); }
};
