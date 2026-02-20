module.exports = (sequelize, DataTypes) => {
    const PasajeroFrecuente = sequelize.define('PasajeroFrecuente', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rut: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                is: /^[0-9]+-[0-9kK]$/
            }
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: false
        },

        imagen_cedula_identidad: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        imagen_certificado: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        razon_rechazo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'INACTIVO'
        }
    }, {
        tableName: 'pasajeros_frecuentes',
        timestamps: true,
        paranoid: true
    });

    const { formatRut } = require('../utils/rut.utils');

    PasajeroFrecuente.addHook('beforeValidate', (pasajero, options) => {
        if (pasajero.rut) {
            pasajero.rut = formatRut(pasajero.rut);
        }
    });

    return PasajeroFrecuente;
};
