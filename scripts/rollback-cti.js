require('dotenv').config();
const { sequelize } = require('../src/models');

async function rollback() {
    try {
        await sequelize.authenticate();
        console.log('🗄️ Conectado a la base de datos');

        // Disable FK checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Drop subtype tables if they exist
        await sequelize.query('DROP TABLE IF EXISTS pasajeros_estudiantes');
        await sequelize.query('DROP TABLE IF EXISTS pasajeros_adulto_mayor');
        console.log('✅ Tablas hijas eliminadas');

        // Revert tipos_pasajero table if needed, but we might keep it or clean it up.
        // For now, let's keep it but maybe empty it or update it.
        // Actually, the new plan doesn't mention type table usage, 
        // but Pasajero model still has tipo_pasajero_id.
        // We will leave it as is for now as per "Clean Pasajeros" step.

        // Re-enable FK checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error al revertir: ${error.message}`);
        process.exit(1);
    }
}

rollback();
