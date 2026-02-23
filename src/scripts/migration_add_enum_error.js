const { sequelize } = require('../models');

async function updateEnumState() {
    try {
        console.log('--- Iniciando actualización del ENUM estado en tabla eventos ---');
        // Add error_confirmacion to the ENUM
        await sequelize.query("ALTER TYPE enum_eventos_estado ADD VALUE IF NOT EXISTS 'error_confirmacion';");
        console.log('--- ENUM actualizado exitosamente ---');
        process.exit(0);
    } catch (error) {
        console.error('Error al actualizar el ENUM:', error);
        process.exit(1);
    }
}

updateEnumState();
