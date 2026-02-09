const sequelize = require('../src/config/sequelize');

async function migrate() {
    try {
        console.log('--- Iniciando migración: add empresa_id to apis_consulta ---');

        // 1. Verificar si la columna ya existe
        const [columns] = await sequelize.query("SHOW COLUMNS FROM apis_consulta LIKE 'empresa_id'");

        if (columns.length === 0) {
            console.log('Añadiendo columna empresa_id...');
            await sequelize.query('ALTER TABLE apis_consulta ADD COLUMN empresa_id INT');

            console.log('Añadiendo constraint fk_apis_consulta_empresa...');
            await sequelize.query(`
                ALTER TABLE apis_consulta 
                ADD CONSTRAINT fk_apis_consulta_empresa 
                FOREIGN KEY (empresa_id) REFERENCES empresas(id)
                ON DELETE SET NULL
            `);
            console.log('✅ Migración completada exitosamente.');
        } else {
            console.log('ℹ️ La columna empresa_id ya existe. Omitiendo.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

migrate();
