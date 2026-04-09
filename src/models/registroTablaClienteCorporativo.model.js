module.exports = (sequelize, DataTypes) => {
  return sequelize.define('RegistroTablaClienteCorporativo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_tabla: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    nombre_display: { type: DataTypes.STRING(150), allowNull: false },
    empresa_id: { type: DataTypes.INTEGER, allowNull: true },
    convenio_id: { type: DataTypes.INTEGER, allowNull: true },
    api_consulta_id: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.STRING(20), defaultValue: 'ACTIVO' }
  }, {
    tableName: 'registro_tablas_clientes_corporativos',
    timestamps: true,
    paranoid: true
  });
};
