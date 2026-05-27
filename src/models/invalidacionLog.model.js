module.exports = (sequelize, DataTypes) => {
    const InvalidacionLog = sequelize.define('InvalidacionLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        endpoint: {
            type: DataTypes.STRING,
            allowNull: true
        },
        metodo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        rut: {
            type: DataTypes.STRING,
            allowNull: true
        },
        pnr: {
            type: DataTypes.STRING,
            allowNull: true
        },
        numero_ticket: {
            type: DataTypes.STRING,
            allowNull: true
        },
        error_mensaje: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        payload: {
            type: DataTypes.JSON,
            allowNull: true
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: true
        },
        user_identifier: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'invalidacion_logs',
        timestamps: false
    });

    return InvalidacionLog;
};
