const { DataTypes } = require('sequelize');

/**
 * Define un modelo Sequelize de forma dinámica para una tabla de CLIENTES CORPORATIVOS.
 */
function definirModeloDinamico(sequelize, nombreTabla) {
  if (sequelize.models[nombreTabla]) {
    return sequelize.models[nombreTabla];
  }

  return sequelize.define(nombreTabla, {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rut: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    nombre_completo: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.STRING(20), defaultValue: 'ACTIVO' },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    convenio_id: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: nombreTabla,
    timestamps: true,
    paranoid: true
  });
}

module.exports = definirModeloDinamico;
