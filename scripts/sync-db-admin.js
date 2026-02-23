require('dotenv').config();
const { sequelize, TipoPasajero } = require('../src/models');
const logger = require('../src/utils/logger');

async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('🗄️ Conectado a la base de datos');

        // 1. Disable FK checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Clean up legacy references to avoid constraint errors during sync
        await sequelize.query('UPDATE pasajeros SET tipo_pasajero_id = NULL');
        console.log('🧹 Referencias legacy de tipo_pasajero eliminadas (NULL)');

        // 2. Truncate tipos_pasajero to reset catalog
        await sequelize.query('TRUNCATE TABLE tipos_pasajero');

        // 3. Sync with alter: true to update schema constraints AND columns
        await sequelize.sync({ alter: true });
        console.log('🗄️ Modelos sincronizados (alter: true)');

        // 4. Seeding skipped for Types to avoid conflict with legacy schema
        // If needed, we can seed basic types here but matching the model structure

        // 5. Re-enable FK checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');


        process.exit(0);
    } catch (error) {
        console.error(`❌ Error al sincronizar: ${error.message}`);
        process.exit(1);
    }
}

syncDatabase();
