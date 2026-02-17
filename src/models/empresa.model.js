module.exports = (sequelize, DataTypes) => {
  const Empresa = sequelize.define('Empresa', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    rut_empresa: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        is: {
          args: /^[0-9]+-[0-9kK]$/,
          msg: 'El RUT debe tener el formato xxxxxxxx-x (números y guion)'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
      defaultValue: 'ACTIVO'
    }
  }, {
    tableName: 'empresas',
    timestamps: true,
    paranoid: true
  });

  return Empresa;
};
