
const { sequelize } = require('../models');
const { QueryInterface, DataTypes } = require('sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Iniciando Migración: Agregar imagen_certificado a Pasajeros Frecuentes ---');

        const table = await queryInterface.describeTable('pasajeros_frecuentes');

        if (!table.imagen_certificado) {
            await queryInterface.addColumn('pasajeros_frecuentes', 'imagen_certificado', {
                type: DataTypes.TEXT('long'),
                allowNull: true
            });
            console.log('  - Columna imagen_certificado agregada');
        } else {
            console.log('  - Columna imagen_certificado ya existe');
        }

        console.log('--- Migración completada exitosamente ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
