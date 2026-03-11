const { sequelize, Estudiante, AdultoMayor, PasajeroFrecuente, Beneficiario } = require('../../models');

async function backfillBeneficios() {
    console.log('--- Iniciando Backfill de Beneficiarios (Desde Producción) ---');
    const transaction = await sequelize.transaction();

    try {
        // Encontrar modelo beneficiario específicamente
        const BeneficiarioModel = Beneficiario;

        // 1. Migrar Estudiantes
        const estudiantes = await Estudiante.findAll({ paranoid: false });
        console.log(`Migrando ${estudiantes.length} estudiantes...`);
        for (const e of estudiantes) {
            await BeneficiarioModel.upsert({
                nombre: e.nombre,
                rut: e.rut,
                telefono: e.telefono,
                correo: e.correo,
                direccion: e.direccion,
                status: e.status,
                razon_rechazo: e.razon_rechazo,
                tipo_beneficio: 'ESTUDIANTE',
                nombre_beneficio: 'Estudiante',
                imagenes: {
                    cedula_identidad: e.imagen_cedula_identidad,
                    certificado_alumno_regular: e.imagen_certificado_alumno_regular
                },
                createdAt: e.createdAt,
                updatedAt: e.updatedAt,
                deletedAt: e.deletedAt
            }, { transaction });
        }

        // 2. Migrar Adultos Mayores
        const adultosMayores = await AdultoMayor.findAll({ paranoid: false });
        console.log(`Migrando ${adultosMayores.length} adultos mayores...`);
        for (const am of adultosMayores) {
            await BeneficiarioModel.upsert({
                nombre: am.nombre,
                rut: am.rut,
                telefono: am.telefono,
                correo: am.correo,
                direccion: am.direccion,
                status: am.status,
                razon_rechazo: am.razon_rechazo,
                tipo_beneficio: 'ADULTO_MAYOR',
                nombre_beneficio: 'Adulto Mayor',
                imagenes: {
                    cedula_identidad: am.imagen_cedula_identidad,
                    certificado_residencia: am.imagen_certificado_residencia,
                    certificado: am.certificado
                },
                createdAt: am.createdAt,
                updatedAt: am.updatedAt,
                deletedAt: am.deletedAt
            }, { transaction });
        }

        // 3. Migrar Pasajeros Frecuentes
        const pasajerosFrecuentes = await PasajeroFrecuente.findAll({ paranoid: false });
        console.log(`Migrando ${pasajerosFrecuentes.length} pasajeros frecuentes...`);
        for (const pf of pasajerosFrecuentes) {
            await BeneficiarioModel.upsert({
                nombre: pf.nombre,
                rut: pf.rut,
                telefono: pf.telefono,
                correo: pf.correo,
                direccion: pf.direccion,
                status: pf.status,
                razon_rechazo: pf.razon_rechazo,
                tipo_beneficio: 'PASAJERO_FRECUENTE',
                nombre_beneficio: 'Pasajero Frecuente',
                imagenes: {
                    cedula_identidad: pf.imagen_cedula_identidad,
                    certificado: pf.imagen_certificado
                },
                createdAt: pf.createdAt,
                updatedAt: pf.updatedAt,
                deletedAt: pf.deletedAt
            }, { transaction });
        }

        // 4. Migrar Carabineros
        const carabineros = await sequelize.models.Carabinero.findAll({ paranoid: false });
        console.log(`Migrando ${carabineros.length} carabineros...`);
        for (const c of carabineros) {
            await BeneficiarioModel.upsert({
                nombre: c.nombre_completo,
                rut: c.rut,
                status: c.status || 'ACTIVO',
                tipo_beneficio: 'CARABINERO',
                nombre_beneficio: 'Institucional Carabineros',
                empresa_id: c.empresa_id || 101,
                convenio_id: c.convenio_id || 158,
                imagenes: {},
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                deletedAt: c.deletedAt
            }, { transaction });
        }

        // 5. Migrar FACH
        const fuchs = await sequelize.models.Fach.findAll({ paranoid: false });
        console.log(`Migrando ${fuchs.length} registros FACH...`);
        for (const f of fuchs) {
            await BeneficiarioModel.upsert({
                nombre: f.nombre_completo,
                rut: f.rut,
                status: f.status || 'ACTIVO',
                tipo_beneficio: 'FACH',
                nombre_beneficio: 'Institucional FACH',
                empresa_id: f.empresa_id || 101,
                convenio_id: f.convenio_id || 158,
                imagenes: {},
                createdAt: f.createdAt,
                updatedAt: f.updatedAt,
                deletedAt: f.deletedAt
            }, { transaction });
        }

        await transaction.commit();
        console.log('--- Backfill completado con éxito ---');
    } catch (error) {
        await transaction.rollback();
        console.error('--- Error durante el backfill:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

backfillBeneficios().then(() => process.exit(0));
