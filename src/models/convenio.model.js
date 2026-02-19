module.exports = (sequelize, DataTypes) => {
    const Convenio = sequelize.define('Convenio', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        empresa_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'El nombre del convenio debe ser único'
            }
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: true
        },
        fecha_termino: {
            type: DataTypes.DATE,
            allowNull: true
        },
        tipo: {
            type: DataTypes.ENUM('API_EXTERNA', 'CODIGO_DESCUENTO'),
            allowNull: true,
            defaultValue: 'CODIGO_DESCUENTO'
        },
        // Relación con tabla externa de configuración de APIs
        api_consulta_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        tope_monto_descuento: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Monto máximo acumulado de descuentos permitido'
        },
        tope_cantidad_tickets: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Cantidad máxima de tickets permitida'
        },
        porcentaje_descuento: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: 'Porcentaje de descuento (0-100)'
        },
        codigo: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Código de descuento opcional para el convenio'
        },
        limitar_por_stock: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Si es true, valida tope_cantidad_tickets'
        },
        limitar_por_monto: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Si es true, valida tope_monto_descuento'
        },
        consumo_tickets: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            comment: 'Total de tickets vendidos con este convenio'
        },
        consumo_monto_descuento: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            comment: 'Total de descuento entregado con este convenio'
        },
        beneficio: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        imagenes: {
            type: DataTypes.JSON, // Array of strings
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'ACTIVO'
        }
    }, {
        tableName: 'convenios',
        timestamps: true,
        paranoid: true
    });

    return Convenio;
};
