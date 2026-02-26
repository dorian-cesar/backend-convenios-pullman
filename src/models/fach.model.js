module.exports = (sequelize, DataTypes) => {
    const Fach = sequelize.define('Fach', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false
        },
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

    return Fach;
};
