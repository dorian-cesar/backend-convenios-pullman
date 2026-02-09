module.exports = (sequelize, DataTypes) => {
    const ApiConsulta = sequelize.define('ApiConsulta', {
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
            allowNull: true, // Optional for internal templates, but required for external ones handled by the user
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
        tableName: 'apis_consulta',
        timestamps: false
    });

    return ApiConsulta;
};
