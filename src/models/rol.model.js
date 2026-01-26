module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.ENUM('USUARIO', 'SUPER_USUARIO'),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
      defaultValue: 'ACTIVO'
    }
  }, {
    tableName: 'roles',
    timestamps: true
  });

  return Rol;
};
