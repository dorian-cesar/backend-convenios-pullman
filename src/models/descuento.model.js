module.exports = (sequelize, DataTypes) => {
    const Descuento = sequelize.define('Descuento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        codigo_descuento_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        tipo_pasajero_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        pasajero_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        porcentaje_descuento: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'ACTIVO'
        }
    }, {
        tableName: 'descuentos',
        timestamps: false
    });

    return Descuento;
};
