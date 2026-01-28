module.exports = (sequelize, DataTypes) => {
    const Evento = sequelize.define('Evento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        // COMPRA | CAMBIO | DEVOLUCION
        tipo_evento: {
            type: DataTypes.ENUM('COMPRA', 'CAMBIO', 'DEVOLUCION'),
            allowNull: false
        },

        // 🔗 TRAZABILIDAD
        evento_origen_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'EVENTOS',
                key: 'id'
            }
        },

        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        pasajero_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        empresa_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        convenio_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        codigo_descuento_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        ciudad_origen: {
            type: DataTypes.STRING,
            allowNull: false
        },

        ciudad_destino: {
            type: DataTypes.STRING,
            allowNull: false
        },

        fecha_viaje: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        numero_asiento: {
            type: DataTypes.STRING,
            allowNull: true
        },

        tarifa_base: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        porcentaje_descuento_aplicado: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        monto_pagado: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        monto_devolucion: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        // Soft delete lógico (no borres eventos)
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        fecha_evento: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }

    }, {
        tableName: 'EVENTOS',
        timestamps: false
    });

    return Evento;
};
