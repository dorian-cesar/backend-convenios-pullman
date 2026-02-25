module.exports = (sequelize, DataTypes) => {
    const ConvenioRutaConfiguracion = sequelize.define('ConvenioRutaConfiguracion', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        convenio_ruta_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tipo_viaje: {
            type: DataTypes.ENUM('solo_ida', 'ida_vuelta'),
            allowNull: false
        },
        tipo_asiento: {
            type: DataTypes.ENUM('semi_cama', 'cama', 'premium'),
            allowNull: false
        },
        tipo_beneficio: {
            type: DataTypes.ENUM('porcentaje', 'monto_descuento', 'monto_fijo'),
            allowNull: false
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        limite_asientos: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: 'convenio_ruta_configuraciones',
        timestamps: true
    });

    ConvenioRutaConfiguracion.associate = function (models) {
        ConvenioRutaConfiguracion.belongsTo(models.ConvenioRuta, {
            foreignKey: 'convenio_ruta_id',
            as: 'ruta'
        });
    };

    return ConvenioRutaConfiguracion;
};
