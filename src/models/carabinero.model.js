module.exports = (sequelize, DataTypes) => {
    const Carabinero = sequelize.define('Carabinero', {
        rut: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        nombre_completo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true
        },
        empresa_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'carabineros',
        timestamps: true,
        paranoid: true
    });

    const { formatRut } = require('../utils/rut.utils');

    Carabinero.addHook('beforeValidate', (carabinero, options) => {
        if (carabinero.rut) {
            carabinero.rut = formatRut(carabinero.rut);
        }
    });

    // Shadow Writing Hooks for Safe Migration
    const syncWithBeneficio = async (carabinero, options) => {
        const { Beneficio } = sequelize.models;
        const data = {
            nombre: carabinero.nombre_completo,
            rut: carabinero.rut,
            status: carabinero.status || 'ACTIVO',
            tipo_beneficio: 'CARABINERO',
            nombre_beneficio: 'Institucional Carabineros',
            empresa_id: carabinero.empresa_id || 101, // Default institucional
            convenio_id: carabinero.convenio_id || 158,
            imagenes: {} // Carabineros usually don't have images in this flow
        };

        await Beneficio.upsert(data, { 
            transaction: options.transaction,
            conflictFields: ['rut', 'tipo_beneficio']
        });
    };

    Carabinero.addHook('afterCreate', syncWithBeneficio);
    Carabinero.addHook('afterUpdate', syncWithBeneficio);

    return Carabinero;
};
