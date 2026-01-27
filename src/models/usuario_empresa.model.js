module.exports = (sequelize, DataTypes) => {
  const UsuarioEmpresa = sequelize.define('UsuarioEmpresa', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
      defaultValue: 'ACTIVO'
    }
  }, {
    tableName: 'usuario_empresa',
    timestamps: true
  });

  return UsuarioEmpresa;
};
