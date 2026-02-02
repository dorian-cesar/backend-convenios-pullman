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
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        fecha_termino: {
            type: DataTypes.DATEONLY,
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
