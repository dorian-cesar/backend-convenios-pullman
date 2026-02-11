const sequelize = require('../src/config/sequelize');

async function migrate() {
    try {
        console.log('--- Iniciando migración: make usuario_id optional in eventos ---');

        // Modificar columna usuario_id para permitir NULL
        console.log('Modificando columna usuario_id...');
        // Primero eliminamos la FK si existe (dependiendo del dialecto y si tiene nombre automático o específico)
        // En este caso, simplemente intentamos el ALTER TABLE directamente ya que MySQL permite cambiar nulidad sin borrar FK si se redefine correctamente.

        await sequelize.query('ALTER TABLE eventos MODIFY COLUMN usuario_id INT NULL');

        console.log('✅ Migración completada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

migrate();
