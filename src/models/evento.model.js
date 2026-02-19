module.exports = (sequelize, DataTypes) => {
    const Evento = sequelize.define('Evento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        // COMPRA | DEVOLUCION (CAMBIO eliminado)
        tipo_evento: {
            type: DataTypes.ENUM('COMPRA', 'DEVOLUCION'),
            allowNull: false
        },

        tipo_pago: {
            type: DataTypes.STRING,
            allowNull: true
        },

        // 🔗 TRAZABILIDAD (Eliminada referencia directa, se usa Ticket/PNR)

        // usuario_id removed

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

        numero_ticket: {
            type: DataTypes.STRING,
            allowNull: true
        },

        pnr: {
            type: DataTypes.STRING,
            allowNull: true
        },

        hora_salida: {
            type: DataTypes.STRING,
            allowNull: true
        },

        terminal_origen: {
            type: DataTypes.STRING,
            allowNull: true
        },

        terminal_destino: {
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

        // Sof delete lógico manejado por paranoid

        fecha_evento: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        // 💳 TRANSBANK FIELDS
        codigo_autorizacion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        estado: {
            type: DataTypes.ENUM('confirmado', 'anulado', 'revertido'),
            allowNull: true
        }

    }, {
        tableName: 'eventos',
        timestamps: true,
        paranoid: true
    });

    return Evento;
};
