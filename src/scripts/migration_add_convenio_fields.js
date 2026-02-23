
const { sequelize } = require('../models');
const { QueryInterface, DataTypes } = require('sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Iniciando Migración: Agregar campos beneficio e imagenes a Convenios ---');

        const table = await queryInterface.describeTable('convenios');

        if (!table.beneficio) {
            await queryInterface.addColumn('convenios', 'beneficio', {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: true
            });
            console.log('  - Columna beneficio agregada');
        } else {
            console.log('  - Columna beneficio ya existe');
        }

        if (!table.imagenes) {
            await queryInterface.addColumn('convenios', 'imagenes', {
                type: DataTypes.JSON,
                allowNull: true
            });
            console.log('  - Columna imagenes agregada');
        } else {
            console.log('  - Columna imagenes ya existe');
        }

        console.log('--- Migración completada exitosamente ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
