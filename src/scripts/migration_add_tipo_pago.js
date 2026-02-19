
const { sequelize } = require('../models');
const { QueryInterface, DataTypes } = require('sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Iniciando Migración: Agregar tipo_pago a Eventos ---');

        const tableEventos = await queryInterface.describeTable('eventos');

        if (!tableEventos.tipo_pago) {
            await queryInterface.addColumn('eventos', 'tipo_pago', {
                type: DataTypes.STRING,
                allowNull: true
            });
            console.log('  - Columna tipo_pago añadida a la tabla eventos');
        } else {
            console.log('  - La columna tipo_pago ya existe.');
        }

        console.log('--- Migración completada exitosamente ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
