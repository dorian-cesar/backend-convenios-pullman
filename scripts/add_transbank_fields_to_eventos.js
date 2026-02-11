const sequelize = require('../src/config/sequelize');

async function migrate() {
    try {
        console.log('--- Iniciando migración: add Transbank fields to eventos ---');

        // 1. Agregar codigo_autorizacion
        const [codigoCol] = await sequelize.query("SHOW COLUMNS FROM eventos LIKE 'codigo_autorizacion'");
        if (codigoCol.length === 0) {
            console.log('Añadiendo columna codigo_autorizacion...');
            await sequelize.query('ALTER TABLE eventos ADD COLUMN codigo_autorizacion VARCHAR(255) NULL');
        }

        // 2. Agregar token
        const [tokenCol] = await sequelize.query("SHOW COLUMNS FROM eventos LIKE 'token'");
        if (tokenCol.length === 0) {
            console.log('Añadiendo columna token...');
            await sequelize.query('ALTER TABLE eventos ADD COLUMN token VARCHAR(255) NULL');
        }

        // 3. Agregar estado
        const [estadoCol] = await sequelize.query("SHOW COLUMNS FROM eventos LIKE 'estado'");
        if (estadoCol.length === 0) {
            console.log('Añadiendo columna estado...');
            await sequelize.query("ALTER TABLE eventos ADD COLUMN estado ENUM('confirmado', 'anulado', 'revertido') NULL");
        }

        console.log('✅ Migración completada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

migrate();
