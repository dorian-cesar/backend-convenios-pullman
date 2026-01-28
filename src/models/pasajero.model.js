module.exports = (sequelize, DataTypes) => {
    const Pasajero = sequelize.define('Pasajero', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rut: {
            type: DataTypes.STRING,
            allowNull: true
        },
        nombres: {
            type: DataTypes.STRING,
            allowNull: true
        },
        apellidos: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true
        },
        tipo_pasajero_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        empresa_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'ACTIVO'
        }
    }, {
        tableName: 'PASAJEROS',
        timestamps: false
    });

    return Pasajero;
};
