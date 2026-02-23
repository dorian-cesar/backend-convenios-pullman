const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Iniciando Migración: Agregar razon_rechazo ---');

        const tables = ['estudiantes', 'adultos_mayores', 'pasajeros_frecuentes'];

        for (const tableName of tables) {
            const tableAttributes = await queryInterface.describeTable(tableName);

            if (!tableAttributes.razon_rechazo) {
                await queryInterface.addColumn(tableName, 'razon_rechazo', {
                    type: DataTypes.STRING,
                    allowNull: true
                });
                console.log(`  - Columna razon_rechazo agregada a ${tableName}`);
            } else {
                console.log(`  - Columna razon_rechazo ya existe en ${tableName}`);
            }
        }

        console.log('--- Migración completada exitosamente ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
