const sequelize = require('../src/utils/connection');

async function dropUsuarioId() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida.');

        // Only for MySQL/MariaDB
        const query = `
      ALTER TABLE eventos
      DROP FOREIGN KEY eventos_ibfk_2, -- Assuming fk_usuario or ibfk_2, might need to check exact name first
      DROP COLUMN IF EXISTS usuario_id;
    `;

        // Safer approach: Drop column directly if no FK constraint or handle error
        try {
            // Try removing FK first, catching error if it doesn't exist
            await sequelize.query(`ALTER TABLE eventos DROP FOREIGN KEY eventos_ibfk_1`).catch(e => console.log('FK 1 likely not existing or different name', e.message));
            // Note: FK names are auto-generated. Usually better to check information_schema, but for now we try simple drop column
            // If column has FK, DROP COLUMN might fail depending on DB/version.
            // Let's try to just drop the column and see. Use raw query.

            await sequelize.query('ALTER TABLE eventos DROP COLUMN usuario_id');
            console.log('Columna usuario_id eliminada.');
        } catch (err) {
            console.error('Error eliminando columna (puede ser por FK):', err.message);
            // Fallback: Try to find FK name and drop it
            console.log('Intentando buscar y eliminar FK...');
            const [results] = await sequelize.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'eventos' AND COLUMN_NAME = 'usuario_id' AND TABLE_SCHEMA = DATABASE();
        `);

            if (results.length > 0) {
                const fkName = results[0].CONSTRAINT_NAME;
                console.log(`FK encontrada: ${fkName}. Eliminando...`);
                await sequelize.query(`ALTER TABLE eventos DROP FOREIGN KEY ${fkName}`);
                await sequelize.query('ALTER TABLE eventos DROP COLUMN usuario_id');
                console.log('Columna usuario_id eliminada tras borrar FK.');
            } else {
                console.log('No se encontró FK, quizás la columna ya no existe.');
            }
        }

    } catch (error) {
        console.error('Error general:', error);
    } finally {
        process.exit();
    }
}

dropUsuarioId();
