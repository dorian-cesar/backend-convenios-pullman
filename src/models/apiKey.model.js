const crypto = require('crypto');

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
            allowNull: true,
            unique: true
        },
        status: {
            type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
            defaultValue: 'ACTIVO'
        }
    }, {
        tableName: 'api_keys',
        timestamps: true,
        hooks: {
            beforeCreate: (apiKey) => {
                if (!apiKey.key) {
                    apiKey.key = 'pb_' + crypto.randomBytes(24).toString('hex');
                }
            }
        }
    });

    return ApiKey;
};
