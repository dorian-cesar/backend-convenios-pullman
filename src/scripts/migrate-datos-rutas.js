require('dotenv').config();
const { sequelize, Convenio } = require('../models');
const logger = require('../utils/logger');

async function migrateData() {
    try {
        await sequelize.authenticate();
        logger.info('🗄️ Conectado a la BD. Iniciando sync para crear/alterar tablas...');

        // El alter: true creará las nuevas tablas y añadirá las nuevas columnas
        // a 'convenios'. Como tienen defaultValue, Sequelize debería poblar los existentes.
        await sequelize.sync({ alter: true });
        logger.info('✅ Esquema actualizado exitosamente');

        logger.info('🔄 Iniciando backfill de datos para convenios existentes...');

        // Mapear porcentaje_descuento a valor_descuento
        const convenios = await Convenio.findAll({
            where: {
                valor_descuento: null
            }
        });

        let upds = 0;
        for (const conv of convenios) {
            conv.valor_descuento = conv.porcentaje_descuento;
            // Si el tipo descuento no se propagó correctamente por defaultValue
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
