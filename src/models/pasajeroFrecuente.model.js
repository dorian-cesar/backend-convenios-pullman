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
                is: /^[0-9]+-[0-9kKxX]$/
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

    // Shadow Writing Hooks for Safe Migration
    const syncWithBeneficio = async (pasajero, options) => {
        const { Beneficiario } = sequelize.models;
        const data = {
            nombre: pasajero.nombre,
            rut: pasajero.rut,
            telefono: pasajero.telefono,
            correo: pasajero.correo,
            direccion: pasajero.direccion,
            status: pasajero.status,
            razon_rechazo: pasajero.razon_rechazo,
            convenio_id: 158,
            imagenes: {
                cedula_identidad: pasajero.imagen_cedula_identidad,
                certificado: pasajero.imagen_certificado
            }
        };

        await Beneficiario.upsert(data, { 
            transaction: options.transaction,
            conflictFields: ['rut', 'convenio_id']
        });
    };

    PasajeroFrecuente.addHook('afterCreate', syncWithBeneficio);
    PasajeroFrecuente.addHook('afterUpdate', syncWithBeneficio);

    return PasajeroFrecuente;
};
