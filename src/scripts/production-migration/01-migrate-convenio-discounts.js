require('dotenv').config();
const { sequelize, Convenio } = require('../../models');
const { DataTypes } = require('sequelize');
const logger = require('../../utils/logger');

async function migrateData() {
    const queryInterface = sequelize.getQueryInterface();
    try {
        await sequelize.authenticate();
        logger.info('🗄️ Conectado a la BD. Verificando columnas en tabla convenios...');

        const table = await queryInterface.describeTable('convenios');

        // 1. Agregar columnas si no existen
        if (!table.tipo_alcance) {
            await queryInterface.addColumn('convenios', 'tipo_alcance', {
                type: DataTypes.ENUM('Global', 'Rutas Especificas'),
                allowNull: false,
                defaultValue: 'Global'
            });
            logger.info('  - Columna tipo_alcance agregada');
        }

        if (!table.tipo_descuento) {
            await queryInterface.addColumn('convenios', 'tipo_descuento', {
                type: DataTypes.ENUM('Porcentaje', 'Monto Fijo', 'Tarifa Plana'),
                allowNull: false,
                defaultValue: 'Porcentaje'
            });
            logger.info('  - Columna tipo_descuento agregada');
        }

        if (!table.valor_descuento) {
            await queryInterface.addColumn('convenios', 'valor_descuento', {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            });
            logger.info('  - Columna valor_descuento agregada');
        }

        if (!table.rutas) {
            await queryInterface.addColumn('convenios', 'rutas', {
                type: DataTypes.JSON,
                allowNull: true
            });
            logger.info('  - Columna rutas agregada');
        }

        logger.info('✅ Columnas verificadas/agregadas exitosamente');

        // 2. Backfill de datos
        logger.info('🔄 Iniciando backfill de datos para convenios existentes...');

        const convenios = await Convenio.findAll({
            where: {
                valor_descuento: null
            }
        });

        let upds = 0;
        for (const conv of convenios) {
            // Migrar porcentaje_descuento a valor_descuento
            conv.valor_descuento = conv.porcentaje_descuento;
            conv.tipo_descuento = 'Porcentaje';
            conv.tipo_alcance = 'Global';
            await conv.save();
            upds++;
        }

        logger.info(`✅ Migración de datos completada. ${upds} convenios actualizados.`);
        process.exit(0);
    } catch (error) {
        logger.error('❌ Error en la migración: ', error);
        process.exit(1);
    }
}

migrateData();
