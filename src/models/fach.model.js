module.exports = (sequelize, DataTypes) => {
    const Fach = sequelize.define('Fach', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        rut: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        nombre_completo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'ACTIVO'
        },
        empresa_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 101
        },
        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 158
        }
    }, {
        tableName: 'fach',
        timestamps: true,
        paranoid: true
    });

    const { formatRut } = require('../utils/rut.utils');

    Fach.addHook('beforeValidate', (fach, options) => {
        if (fach.rut) {
            fach.rut = formatRut(fach.rut);
        }
    });

    // Shadow Writing Hooks for Safe Migration
    const syncWithBeneficio = async (fach, options) => {
        const { Beneficiario } = sequelize.models;
        const data = {
            nombre: fach.nombre_completo,
            rut: fach.rut,
            status: fach.status || 'ACTIVO',
            convenio_id: fach.convenio_id || 158,
            imagenes: {}
        };

        await Beneficiario.upsert(data, { 
            transaction: options.transaction,
            conflictFields: ['rut', 'convenio_id']
        });
    };

    Fach.addHook('afterCreate', syncWithBeneficio);
    Fach.addHook('afterUpdate', syncWithBeneficio);

    return Fach;
};
