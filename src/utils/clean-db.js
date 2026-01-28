const { sequelize } = require('../models');

async function cleanDb() {
    try {
        await sequelize.authenticate();
        console.log('🗑️  Iniciando limpieza de base de datos...');

        // Desactivar checks de llaves foráneas para poder truncar en cualquier orden
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

        const models = Object.keys(sequelize.models);
        for (const modelName of models) {
            const model = sequelize.models[modelName];
            console.log(`   Truncando tabla: ${model.tableName}`);
            await model.destroy({ truncate: true, cascade: true });
        }

        // Reactivar checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

        console.log('✅ Base de datos limpiada correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error limpiando base de datos:', error);
        process.exit(1);
    }
}

cleanDb();
