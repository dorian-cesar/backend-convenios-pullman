const { sequelize, Estudiante, AdultoMayor, PasajeroFrecuente, Beneficio } = require('../src/models');

async function migrateData() {
    console.log('--- Iniciando migración de beneficios ---');
    const transaction = await sequelize.transaction();

    try {
        // Migrar Estudiantes
        const estudiantes = await Estudiante.findAll({ paranoid: false });
        console.log(`Migrando ${estudiantes.length} estudiantes...`);
        for (const e of estudiantes) {
            await Beneficio.create({
                nombre: e.nombre,
                rut: e.rut,
                telefono: e.telefono,
                correo: e.correo,
                direccion: e.direccion,
                imagen_cedula_identidad: e.imagen_cedula_identidad,
                imagen_respaldo: e.imagen_certificado_alumno_regular,
                razon_rechazo: e.razon_rechazo,
                status: e.status,
                tipo_beneficio: 'ESTUDIANTE',
                createdAt: e.createdAt,
                updatedAt: e.updatedAt,
                deletedAt: e.deletedAt
            }, { transaction, paranoid: false });
        }

        // Migrar Adulto Mayor
        const adultosMayores = await AdultoMayor.findAll({ paranoid: false });
        console.log(`Migrando ${adultosMayores.length} adultos mayores...`);
        for (const am of adultosMayores) {
            await Beneficio.create({
                nombre: am.nombre,
                rut: am.rut,
                telefono: am.telefono,
                correo: am.correo,
                direccion: am.direccion,
                imagen_cedula_identidad: am.imagen_cedula_identidad,
                imagen_respaldo: am.imagen_certificado_residencia || am.certificado,
                razon_rechazo: am.razon_rechazo,
                status: am.status,
                tipo_beneficio: 'ADULTO_MAYOR',
                createdAt: am.createdAt,
                updatedAt: am.updatedAt,
                deletedAt: am.deletedAt
            }, { transaction, paranoid: false });
        }

        // Migrar Pasajero Frecuente
        const pasajerosFrecuentes = await PasajeroFrecuente.findAll({ paranoid: false });
        console.log(`Migrando ${pasajerosFrecuentes.length} pasajeros frecuentes...`);
        for (const pf of pasajerosFrecuentes) {
            await Beneficio.create({
                nombre: pf.nombre,
                rut: pf.rut,
                telefono: pf.telefono,
                correo: pf.correo,
                direccion: pf.direccion,
                imagen_cedula_identidad: pf.imagen_cedula_identidad,
                imagen_respaldo: pf.imagen_certificado,
                razon_rechazo: pf.razon_rechazo,
                status: pf.status,
                tipo_beneficio: 'PASAJERO_FRECUENTE',
                createdAt: pf.createdAt,
                updatedAt: pf.updatedAt,
                deletedAt: pf.deletedAt
            }, { transaction, paranoid: false });
        }

        await transaction.commit();
        console.log('--- Migración completada con éxito ---');
    } catch (error) {
        await transaction.rollback();
        console.error('--- Error durante la migración:', error);
        process.exit(1);
    }
}

migrateData().then(() => process.exit(0));
