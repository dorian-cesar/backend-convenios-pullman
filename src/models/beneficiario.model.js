module.exports = (sequelize, DataTypes) => {
    const Beneficiario = sequelize.define('Beneficiario', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: false // Obligatorio: Liga al Convenio con beneficio=true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rut: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'rut_convenio_id'
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('ACTIVO', 'INACTIVO', 'RECHAZADO'),
            defaultValue: 'INACTIVO'
        },
        imagenes: {
            type: DataTypes.JSON,
            allowNull: true
        },
        razon_rechazo: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'beneficiarios',
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ['rut', 'convenio_id']
            }
        ]
    });

    Beneficiario.associate = (models) => {
        Beneficiario.belongsTo(models.Convenio, {
            foreignKey: 'convenio_id',
            as: 'convenio'
        });
    };

    return Beneficiario;
};
