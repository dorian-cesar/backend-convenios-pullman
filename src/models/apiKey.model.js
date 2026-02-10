module.exports = (sequelize, DataTypes) => {
    const ApiKey = sequelize.define('ApiKey', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        status: {
            type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
            defaultValue: 'ACTIVO'
        }
    }, {
        tableName: 'api_keys',
        timestamps: true
    });

    return ApiKey;
};
