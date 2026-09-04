module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define('Banner', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    list_type: {
      type: DataTypes.ENUM('A', 'B'),
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
      defaultValue: 'ACTIVO'
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
    tableName: 'banners',
    timestamps: true,
    paranoid: true // soft delete support
  });

  return Banner;
};
