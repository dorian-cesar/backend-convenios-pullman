module.exports = (sequelize, DataTypes) => {
    const Estudiante = sequelize.define('Estudiante', {
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
                // Simple regex validation, can be improved
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
            type: DataTypes.TEXT('long'), // For Base64 images
            allowNull: true
        },
        imagen_certificado_alumno_regular: {
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
        tableName: 'estudiantes',
        timestamps: true,
        paranoid: true
    });

    const { formatRut } = require('../utils/rut.utils');

    Estudiante.addHook('beforeValidate', (estudiante, options) => {
        if (estudiante.rut) {
            estudiante.rut = formatRut(estudiante.rut);
        }
    });

    // Shadow Writing Hooks for Safe Migration
    const syncWithBeneficio = async (estudiante, options) => {
        const { Beneficiario } = sequelize.models;
        const data = {
            nombre: estudiante.nombre,
            rut: estudiante.rut,
            telefono: estudiante.telefono,
            correo: estudiante.correo,
            direccion: estudiante.direccion,
            status: estudiante.status,
            razon_rechazo: estudiante.razon_rechazo,
            convenio_id: 158,
            imagenes: {
                cedula_identidad: estudiante.imagen_cedula_identidad,
                certificado_alumno_regular: estudiante.imagen_certificado_alumno_regular
            }
        };

        await Beneficiario.upsert(data, { 
            transaction: options.transaction,
            conflictFields: ['rut', 'convenio_id']
        });
    };

    Estudiante.addHook('afterCreate', syncWithBeneficio);
    Estudiante.addHook('afterUpdate', syncWithBeneficio);

    return Estudiante;
};
