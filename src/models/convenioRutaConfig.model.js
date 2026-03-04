module.exports = (sequelize, DataTypes) => {
    const ConvenioRutaConfig = sequelize.define('ConvenioRutaConfig', {
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
            type: DataTypes.ENUM('Solo Ida', 'Ida y Vuelta'),
            allowNull: false
        },
        tipo_asiento: {
            type: DataTypes.ENUM('Semi Cama', 'Cama', 'Premium'),
            allowNull: false
        },
        precio_solo_ida: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        precio_ida_vuelta: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        max_pasajes: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'convenios_rutas_configs',
        timestamps: true,
        paranoid: true
    });

    return ConvenioRutaConfig;
};
