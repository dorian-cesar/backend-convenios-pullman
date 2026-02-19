
const { sequelize } = require('../models');
const { QueryInterface, DataTypes } = require('sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        console.log('--- Iniciando Migración: Refactor de Imágenes de Documentos ---');

        // 1. Estudiantes
        console.log('Procesando tabla: estudiantes...');
        const tableEstudiantes = await queryInterface.describeTable('estudiantes');

        if (tableEstudiantes.imagen_base64 && !tableEstudiantes.imagen_cedula_identidad) {
            await queryInterface.renameColumn('estudiantes', 'imagen_base64', 'imagen_cedula_identidad');
            console.log('  - Columna imagen_base64 renombrada a imagen_cedula_identidad');
        }

        if (!tableEstudiantes.imagen_certificado_alumno_regular) {
            await queryInterface.addColumn('estudiantes', 'imagen_certificado_alumno_regular', {
                type: DataTypes.TEXT('long'),
                allowNull: true
            });
            console.log('  - Columna imagen_certificado_alumno_regular añadida');
        }

        // 2. Adultos Mayores
        console.log('Procesando tabla: adultos_mayores...');
        const tableAdultos = await queryInterface.describeTable('adultos_mayores');

        if (tableAdultos.imagen_base64 && !tableAdultos.imagen_cedula_identidad) {
            await queryInterface.renameColumn('adultos_mayores', 'imagen_base64', 'imagen_cedula_identidad');
            console.log('  - Columna imagen_base64 renombrada a imagen_cedula_identidad');
        }

        if (!tableAdultos.imagen_certificado_residencia) {
            await queryInterface.addColumn('adultos_mayores', 'imagen_certificado_residencia', {
                type: DataTypes.TEXT('long'),
                allowNull: true
            });
            console.log('  - Columna imagen_certificado_residencia añadida');
        }

        // 3. Pasajeros Frecuentes
        console.log('Procesando tabla: pasajeros_frecuentes...');
        const tableFrecuentes = await queryInterface.describeTable('pasajeros_frecuentes');

        if (tableFrecuentes.imagen_base64 && !tableFrecuentes.imagen_cedula_identidad) {
            await queryInterface.renameColumn('pasajeros_frecuentes', 'imagen_base64', 'imagen_cedula_identidad');
            console.log('  - Columna imagen_base64 renombrada a imagen_cedula_identidad');
        }

        console.log('--- Migración completada exitosamente ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
