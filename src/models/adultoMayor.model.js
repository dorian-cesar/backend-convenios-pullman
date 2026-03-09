module.exports = (sequelize, DataTypes) => {
    const AdultoMayor = sequelize.define('AdultoMayor', {
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
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: false
        },
        certificado: {
            type: DataTypes.STRING,
            allowNull: true
        },
        imagen_cedula_identidad: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        imagen_certificado_residencia: {
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
        tableName: 'adultos_mayores',
        timestamps: true,
        paranoid: true
    });

    const { formatRut } = require('../utils/rut.utils');

    AdultoMayor.addHook('beforeValidate', (adultoMayor, options) => {
        if (adultoMayor.rut) {
            adultoMayor.rut = formatRut(adultoMayor.rut);
        }
    });

    // Shadow Writing Hooks for Safe Migration
    const syncWithBeneficio = async (adultoMayor, options) => {
        const { Beneficio } = sequelize.models;
        const data = {
            nombre: adultoMayor.nombre,
            rut: adultoMayor.rut,
            telefono: adultoMayor.telefono,
            correo: adultoMayor.correo,
            direccion: adultoMayor.direccion,
            status: adultoMayor.status,
            razon_rechazo: adultoMayor.razon_rechazo,
            tipo_beneficio: 'ADULTO_MAYOR',
            nombre_beneficio: 'Adulto Mayor',
            empresa_id: 7, // Empresa Adulto Mayor
            imagenes: {
                cedula_identidad: adultoMayor.imagen_cedula_identidad,
                certificado_residencia: adultoMayor.imagen_certificado_residencia,
                certificado: adultoMayor.certificado
            }
        };

        await Beneficio.upsert(data, { 
            transaction: options.transaction,
            conflictFields: ['rut', 'tipo_beneficio']
        });
    };

    AdultoMayor.addHook('afterCreate', syncWithBeneficio);
    AdultoMayor.addHook('afterUpdate', syncWithBeneficio);

    return AdultoMayor;
};
