module.exports = (sequelize, DataTypes) => {
    const ConvenioRuta = sequelize.define('ConvenioRuta', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        origen_codigo: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        origen_ciudad: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        destino_codigo: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        destino_ciudad: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        tableName: 'convenios_rutas',
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ['convenio_id', 'origen_codigo', 'destino_codigo']
            }
        ]
    });

    return ConvenioRuta;
};
