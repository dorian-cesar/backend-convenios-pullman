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

    return Carabinero;
};
