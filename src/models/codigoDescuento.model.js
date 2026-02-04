module.exports = (sequelize, DataTypes) => {
    const CodigoDescuento = sequelize.define('CodigoDescuento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        codigo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        fecha_termino: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        max_usos: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        usos_realizados: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'ACTIVO'
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'codigos_descuento',
        timestamps: false
    });

    return CodigoDescuento;
};