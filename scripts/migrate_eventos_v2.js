const sequelize = require('../src/config/sequelize');

async function migrate() {
    try {
        console.log('--- Iniciando migración: extender tabla eventos ---');

        const [columns] = await sequelize.query("SHOW COLUMNS FROM eventos LIKE 'numero_ticket'");

        if (columns.length === 0) {
            console.log('Añadiendo nuevos campos a tabla eventos...');
            await sequelize.query(`
                ALTER TABLE eventos 
                ADD COLUMN numero_ticket VARCHAR(255) NULL,
                ADD COLUMN pnr VARCHAR(255) NULL,
                ADD COLUMN hora_salida VARCHAR(255) NULL,
                ADD COLUMN terminal_origen VARCHAR(255) NULL,
                ADD COLUMN terminal_destino VARCHAR(255) NULL
            `);
            console.log('✅ Migración de eventos completada exitosamente.');
        } else {
            console.log('ℹ️ Los campos ya existen en la tabla eventos. Omitiendo.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración de eventos:', error);
        process.exit(1);
    }
}

migrate();
