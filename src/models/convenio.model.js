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
        tipo_alcance: {
            type: DataTypes.ENUM('Global', 'Rutas Especificas'),
            allowNull: false,
            defaultValue: 'Global',
            comment: 'Alcance del convenio (todas las rutas o específicas)'
        },
        tipo_descuento: {
            type: DataTypes.ENUM('Porcentaje', 'Monto Fijo', 'Tarifa Plana'),
            allowNull: false,
            defaultValue: 'Porcentaje',
            comment: 'Forma en que se aplica el descuento'
        },
        valor_descuento: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Valor del descuento (Porcentaje o Monto Fijo). Null para Tarifa Plana'
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
        paranoid: true,
        validate: {
            checkValorDescuento() {
                if (this.tipo_descuento === 'Tarifa Plana' && this.valor_descuento !== null) {
                    throw new Error('El valor_descuento debe ser nulo cuando el tipo_descuento es Tarifa Plana');
                }
                if ((this.tipo_descuento === 'Porcentaje' || this.tipo_descuento === 'Monto Fijo') && this.valor_descuento === null) {
                    // Permitimos el paso momentáneo si tienen porcentaje_descuento configurado a nivel antiguo, 
                    // para no romper la app en el ínterin de migración.
                    if (this.porcentaje_descuento === null || this.porcentaje_descuento === undefined) {
                        throw new Error(`El valor_descuento es obligatorio cuando el tipo_descuento es ${this.tipo_descuento}`);
                    }
                }
            }
        }
    });

    return Convenio;
};
