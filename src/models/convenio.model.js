module.exports = (sequelize, DataTypes) => {
    const Convenio = sequelize.define('Convenio', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        empresa_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: true
        },
        fecha_termino: {
            type: DataTypes.DATE,
            allowNull: true
        },
        tipo: {
            type: DataTypes.ENUM('API_EXTERNA', 'CODIGO_DESCUENTO'),
            allowNull: true,
            defaultValue: 'CODIGO_DESCUENTO'
        },
        endpoint: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'ACTIVO'
        }
    }, {
        tableName: 'convenios',
        timestamps: false
    });

    return Convenio;
};
