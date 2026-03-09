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
        const { Beneficio } = sequelize.models;
        const data = {
            nombre: pasajero.nombre,
            rut: pasajero.rut,
            telefono: pasajero.telefono,
            correo: pasajero.correo,
            direccion: pasajero.direccion,
            status: pasajero.status,
            razon_rechazo: pasajero.razon_rechazo,
            tipo_beneficio: 'PASAJERO_FRECUENTE',
            nombre_beneficio: 'Pasajero Frecuente',
            empresa_id: 8, // Empresa Pasajero Frecuente
            imagenes: {
                cedula_identidad: pasajero.imagen_cedula_identidad,
                certificado: pasajero.imagen_certificado
            }
        };

        await Beneficio.upsert(data, { 
            transaction: options.transaction,
            conflictFields: ['rut', 'tipo_beneficio']
        });
    };

    PasajeroFrecuente.addHook('afterCreate', syncWithBeneficio);
    PasajeroFrecuente.addHook('afterUpdate', syncWithBeneficio);

    return PasajeroFrecuente;
};
