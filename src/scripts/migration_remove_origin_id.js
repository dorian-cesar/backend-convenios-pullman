
const { sequelize } = require('../models');
const { QueryInterface, DataTypes } = require('sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Iniciando Migración: Eliminar evento_origen_id de Eventos ---');

        const tableEventos = await queryInterface.describeTable('eventos');

        if (tableEventos.evento_origen_id) {
            // Primero eliminar la constraint si existe (aunque sequelize suele manejarlo)
            // En SQLite las foreign keys son diferentes, pero intentaremos dropColumn directo.
            await queryInterface.removeColumn('eventos', 'evento_origen_id');
            console.log('  - Columna evento_origen_id eliminada de la tabla eventos');
        } else {
            console.log('  - La columna evento_origen_id ya no existe.');
        }

        console.log('--- Migración completada exitosamente ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);

        // Fallback for SQLite which represents boolean as INTEGER
        if (error.message.includes('SQLITE_ERROR')) {
            console.log('⚠️ SQLite no soporta DROP COLUMN fácilmente. Se recomienda recrear tabla o ignorar en dev local.');
        }
        process.exit(1);
    }
}

migrate();
