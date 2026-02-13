module.exports = (sequelize, DataTypes) => {
    const PasajeroFrecuente = sequelize.define('PasajeroFrecuente', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rut: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                is: /^[0-9]+-[0-9kK]$/
            }
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: false
        },
        codigo_frecuente: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        nivel: {
            type: DataTypes.STRING,
            allowNull: false // e.g., 'GOLD', 'PLATINUM'
        },
        puntos: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        imagen_base64: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'INACTIVO'
        }
    }, {
        tableName: 'pasajeros_frecuentes',
        timestamps: true
    });

    return PasajeroFrecuente;
};
