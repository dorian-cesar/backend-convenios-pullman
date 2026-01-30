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

    nombre: {
      type: DataTypes.STRING,
      allowNull: true
    },

    rut: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        is: {
          args: /^[0-9]+-[0-9kK]$/,
          msg: 'El RUT debe tener el formato xxxxxxxx-x (números y guion)'
        }
      }
    },

    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La contraseña es obligatoria'
        },
        notEmpty: {
          msg: 'La contraseña no puede estar vacía'
        }
      }
    },

    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },

    status: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
      defaultValue: 'ACTIVO'
    },

    telefono: {
      type: DataTypes.STRING,
      allowNull: true
    }

  }, {
    tableName: 'usuarios',
    timestamps: true
  });

  return Usuario;
};
