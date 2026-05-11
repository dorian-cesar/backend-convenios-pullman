module.exports = (sequelize, DataTypes) => {
    const { formatRut } = require('../utils/rut.utils');

    const Pasajero = sequelize.define('Pasajero', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rut: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                is: {
                    args: /^[0-9]+-[0-9kKxX]$/,
                    msg: 'El RUT debe tener el formato xxxxxxxx-x (números y guion)'
                }
            }
        },
        nombres: {
            type: DataTypes.STRING,
            allowNull: true
        },
        apellidos: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true
        },
        tipo_pasajero_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        empresa_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'ACTIVO'
        }
    }, {
        tableName: 'pasajeros',
        timestamps: true,
        paranoid: true,
        hooks: {
            beforeValidate: (pasajero) => {
                if (pasajero.rut) {
                    pasajero.rut = formatRut(pasajero.rut);
                }
            }
        }
    });

    return Pasajero;
};
