module.exports = (sequelize, DataTypes) => {
    const Estudiante = sequelize.define('Estudiante', {
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
                // Simple regex validation, can be improved
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
        carnet_estudiante: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fecha_vencimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        imagen_base64: {
            type: DataTypes.TEXT('long'), // For Base64 images
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'INACTIVO'
        }
    }, {
        tableName: 'estudiantes',
        timestamps: true,
        paranoid: true
    });

    return Estudiante;
};
