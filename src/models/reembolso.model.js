module.exports = (sequelize, DataTypes) => {
    const Reembolso = sequelize.define('Reembolso', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true
        },
        pnr: {
            type: DataTypes.STRING,
            allowNull: false
        },
        categoria: {
            type: DataTypes.ENUM('ANULACION', 'REEMBOLSO'),
            allowNull: false,
            defaultValue: 'REEMBOLSO'
        },
        numero_asiento: {
            type: DataTypes.STRING,
            allowNull: true
        },
        operador: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fecha_cancelacion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        correo: { type: DataTypes.STRING, allowNull: true },
        rut: { type: DataTypes.STRING, allowNull: true },
        numero_cuenta: { type: DataTypes.STRING, allowNull: true },
        banco: { type: DataTypes.STRING, allowNull: true },
        tipo_cuenta: { type: DataTypes.STRING, allowNull: true },
        nombre_beneficiario: { type: DataTypes.STRING, allowNull: true },
        nombre_pasajero: { type: DataTypes.STRING, allowNull: true },
        origen: { type: DataTypes.STRING, allowNull: true },
        destino: { type: DataTypes.STRING, allowNull: true },
        fecha_salida: { type: DataTypes.STRING, allowNull: true },
        canal_venta: { type: DataTypes.STRING, allowNull: true },
        monday_item_id: { type: DataTypes.STRING, allowNull: true },
        estado: { 
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Pending'
        },
        // Auditoría
        created_by: {
            type: DataTypes.STRING,
            allowNull: true
        },
        updated_by: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'reembolsos',
        timestamps: true,
        paranoid: true
    });

    return Reembolso;
};
