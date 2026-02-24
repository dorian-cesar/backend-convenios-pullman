require('dotenv').config();
const { sequelize } = require('../models');

async function runMigration() {
    try {
        await sequelize.authenticate();
        console.log('✅ Base de datos conectada.');

        const queryInterface = sequelize.getQueryInterface();
        const tableName = 'eventos';
        const columnName = 'confirmed_pnrs';

        const tableInfo = await queryInterface.describeTable(tableName);

        if (!tableInfo[columnName]) {
            console.log(`⏳ Añadiendo columna ${columnName} a la tabla ${tableName}...`);
            await queryInterface.addColumn(tableName, columnName, {
                type: sequelize.Sequelize.DataTypes.JSON,
                allowNull: true
            });
            console.log(`✅ Columna ${columnName} añadida exitosamente.`);
        } else {
            console.log(`ℹ️ La columna ${columnName} ya existe en la tabla ${tableName}.`);
        }

        console.log('✅ Migración finalizada.');
    } catch (error) {
        console.error('❌ Error en la migración:', error);
    } finally {
        process.exit(0);
    }
}

runMigration();
