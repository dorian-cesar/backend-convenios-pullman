module.exports = (sequelize, DataTypes) => {
  const Empresa = sequelize.define('Empresa', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    rut: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
      status: {
        type: DataTypes.ENUM('ACTIVO', 'INACTIVA'),
        defaultValue: 'ACTIVO'
      }
  }, {
    tableName: 'empresas',
    timestamps: true
  });

  return Empresa;
};
