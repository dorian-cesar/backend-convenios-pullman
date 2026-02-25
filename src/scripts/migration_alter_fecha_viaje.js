require('dotenv').config();
const { sequelize } = require('../models');

async function runMigration() {
    try {
        await sequelize.authenticate();
        console.log('✅ Base de datos conectada.');

        const queryInterface = sequelize.getQueryInterface();
        const tableName = 'eventos';
        const columnName = 'fecha_viaje';

        console.log(`⏳ Modificando tipo de columna ${columnName} a VARCHAR(255)...`);

        await queryInterface.changeColumn(tableName, columnName, {
            type: sequelize.Sequelize.DataTypes.STRING(255),
            allowNull: false
        });

        console.log(`✅ Columna ${columnName} modificada a VARCHAR (String) exitosamente.`);
        console.log('✅ Migración finalizada.');
    } catch (error) {
        console.error('❌ Error en la migración:', error);
    } finally {
        process.exit(0);
    }
}

runMigration();
