const { sequelize } = require('../models');

async function alterEstadoColumn() {
    try {
        console.log('--- Iniciando alteración de la columna estado a VARCHAR ---');
        // Cambiar la columna estado de ENUM a VARCHAR preservando los datos actuales
        await sequelize.query('ALTER TABLE "eventos" ALTER COLUMN "estado" TYPE VARCHAR(255) USING "estado"::VARCHAR;');
        console.log('--- Columna estado actualizada exitosamente a VARCHAR ---');

        // Opcional: eliminar el ENUM si ya no se usa en otra parte
        try {
            await sequelize.query('DROP TYPE IF EXISTS "enum_eventos_estado";');
            console.log('--- Tipo ENUM antiguo eliminado ---');
        } catch (e) {
            console.log('Nota: no se pudo eliminar el tipo ENUM antiguo (puede que no exista o se use en otro lado).');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error al alterar la columna:', error);
        process.exit(1);
    }
}

alterEstadoColumn();
