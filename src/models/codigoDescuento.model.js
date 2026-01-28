module.exports = (sequelize, DataTypes) => {
    const CodigoDescuento = sequelize.define('CodigoDescuento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        codigo: {
            type: DataTypes.STRING,
            allowNull: true
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
        tableName: 'CODIGOS_DESCUENTO',
        timestamps: false
    });

    return CodigoDescuento;
};