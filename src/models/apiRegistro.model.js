module.exports = (sequelize, DataTypes) => {
    const ApiRegistro = sequelize.define('ApiRegistro', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        endpoint: {
            type: DataTypes.STRING,
            allowNull: false
        },
        empresa_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'empresas',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'ACTIVO'
        }
    }, {
        tableName: 'api_registros',
        timestamps: true,
        paranoid: true
    });

    return ApiRegistro;
};
