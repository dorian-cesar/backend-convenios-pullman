const { sequelize } = require('../models');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Iniciando Migración: Eliminar campos no utilizados ---');

        // Drop carnet_estudiante and fecha_vencimiento from estudiantes
        const tableEstudiantesAttr = await queryInterface.describeTable('estudiantes');
        if (tableEstudiantesAttr.carnet_estudiante) {
            await queryInterface.removeColumn('estudiantes', 'carnet_estudiante');
            console.log('  - Columna carnet_estudiante eliminada de estudiantes');
        }
        if (tableEstudiantesAttr.fecha_vencimiento) {
            await queryInterface.removeColumn('estudiantes', 'fecha_vencimiento');
            console.log('  - Columna fecha_vencimiento eliminada de estudiantes');
        }

        // Drop fecha_emision from adultos_mayores
        const tableAdultosMayoresAttr = await queryInterface.describeTable('adultos_mayores');
        if (tableAdultosMayoresAttr.fecha_emision) {
            await queryInterface.removeColumn('adultos_mayores', 'fecha_emision');
            console.log('  - Columna fecha_emision eliminada de adultos_mayores');
        }

        console.log('--- Migración completada exitosamente ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
