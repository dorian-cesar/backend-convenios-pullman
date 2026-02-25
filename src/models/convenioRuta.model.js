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
        origen: {
            type: DataTypes.STRING,
            allowNull: false
        },
        destino: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'convenio_rutas',
        timestamps: true
    });

    ConvenioRuta.associate = function (models) {
        ConvenioRuta.belongsTo(models.Convenio, {
            foreignKey: 'convenio_id',
            as: 'convenio'
        });

        ConvenioRuta.hasMany(models.ConvenioRutaConfiguracion, {
            foreignKey: 'convenio_ruta_id',
            as: 'configuraciones'
        });
    };

    return ConvenioRuta;
};
