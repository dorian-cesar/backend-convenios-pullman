module.exports = (sequelize, DataTypes) => {
    const TipoPasajero = sequelize.define('TipoPasajero', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: true
        },
        edad_min: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        edad_max: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'TIPOS_PASAJERO',
        timestamps: false
    });

    return TipoPasajero;
};
