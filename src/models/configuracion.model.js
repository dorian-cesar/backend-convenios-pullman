module.exports = (sequelize, DataTypes) => {
  const Configuracion = sequelize.define('Configuracion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clave: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    valor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Campos de Auditoría
    created_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deleted_by: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'configuraciones',
    timestamps: true,
    paranoid: true
  });

  return Configuracion;
};
