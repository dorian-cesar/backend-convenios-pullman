module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'El correo es obligatorio'
        },
        notEmpty: {
          msg: 'El correo no puede estar vacío'
        },
        isEmail: {
          msg: 'El correo no tiene un formato válido'
        }
      }
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La contraseña es obligatoria'
        },
        notEmpty: {
          msg: 'La contraseña no puede estar vacía'
        },
        len: {
          args: [8, 100],
          msg: 'La contraseña debe tener al menos 8 caracteres'
        }
      }
    },

    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El rol es obligatorio'
        },
        isInt: {
          msg: 'El rol debe ser un valor válido'
        }
      }
    },

    status: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
      defaultValue: 'ACTIVO'
    }

  }, {
    tableName: 'usuarios',
    timestamps: true
  });

  return Usuario;
};
