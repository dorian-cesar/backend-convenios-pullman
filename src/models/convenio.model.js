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
            allowNull: false
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
        tope_monto_ventas: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Monto máximo acumulado de ventas permitido'
        },
        tope_cantidad_tickets: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Cantidad máxima de tickets permitida'
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
