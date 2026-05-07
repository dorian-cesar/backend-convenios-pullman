const { sequelize } = require('../src/models');

async function checkSchema() {
    try {
        console.log('--- Iniciando Inspección de Base de Datos ---');
        
        // 1. Verificar tabla categorias
        const [tables] = await sequelize.query("SHOW TABLES LIKE 'categorias'");
        if (tables.length > 0) {
            console.log('✅ Tabla "categorias" detectada.');
            const [columns] = await sequelize.query("DESCRIBE categorias");
            console.log('Estructura de categorias:', columns.map(c => `${c.Field} (${c.Type})`));
        } else {
            console.log('❌ Tabla "categorias" NO encontrada.');
        }

        // 2. Verificar columna en convenios
        const [columnsConv] = await sequelize.query("DESCRIBE convenios");
        const hasCol = columnsConv.some(c => c.Field === 'categoria_id');
        if (hasCol) {
            console.log('✅ Columna "categoria_id" detectada en la tabla "convenios".');
        } else {
            console.log('❌ Columna "categoria_id" NO encontrada en "convenios".');
        }

        console.log('--- Inspección Finalizada ---');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la inspección:', error);
        process.exit(1);
    }
}

checkSchema();
