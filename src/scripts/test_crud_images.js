
require('dotenv').config();
const { sequelize, AdultoMayor, Estudiante, PasajeroFrecuente } = require('../models');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('--- Probando CRUDs con Imágenes (AdultoMayor, Estudiante, PasajeroFrecuente) ---');

        const timestamp = Date.now();

        // 1. Test Adulto Mayor
        console.log('\n--- 1. Adulto Mayor ---');
        const amData = {
            nombre: `AM Test ${timestamp}`,
            rut: `10.100.100-1`, // Mock valid RUT format
            telefono: '123456789',
            correo: `am${timestamp}@test.com`,
            direccion: 'Calle Falsa 123',
            certificado: 'CERT-AM-001',
            fecha_emision: '2025-01-01',
            imagen_cedula_identidad: 'base64_cedula_am',
            imagen_certificado_residencia: 'base64_cert_residencia',
            status: 'ACTIVO'
        };

        // Cleanup previous if exists unique constraint
        await AdultoMayor.destroy({ where: { rut: '10.100.100-1' }, force: true });

        const am = await AdultoMayor.create(amData);
        console.log('✅ Adulto Mayor creado ID:', am.id);
        if (am.imagen_cedula_identidad !== amData.imagen_cedula_identidad) throw new Error('AM: imagen_cedula_identidad mismatch');
        if (am.imagen_certificado_residencia !== amData.imagen_certificado_residencia) throw new Error('AM: imagen_certificado_residencia mismatch');


        // 2. Test Estudiante
        console.log('\n--- 2. Estudiante ---');
        const estData = {
            nombre: `Est Test ${timestamp}`,
            rut: `10.100.100-2`,
            telefono: '987654321',
            correo: `est${timestamp}@test.com`,
            direccion: 'Avenida Siempre Viva 742',
            carnet_estudiante: 'TNE-2025',
            fecha_vencimiento: '2025-12-31',
            imagen_cedula_identidad: 'base64_cedula_est',
            imagen_certificado_alumno_regular: 'base64_cert_alumno',
            status: 'ACTIVO'
        };

        await Estudiante.destroy({ where: { rut: '10.100.100-2' }, force: true });

        const est = await Estudiante.create(estData);
        console.log('✅ Estudiante creado ID:', est.id);
        if (est.imagen_cedula_identidad !== estData.imagen_cedula_identidad) throw new Error('EST: imagen_cedula_identidad mismatch');
        if (est.imagen_certificado_alumno_regular !== estData.imagen_certificado_alumno_regular) throw new Error('EST: imagen_certificado_alumno_regular mismatch');


        // 3. Test Pasajero Frecuente
        console.log('\n--- 3. Pasajero Frecuente ---');
        const pfData = {
            nombre: `PF Test ${timestamp}`,
            rut: `10.100.100-3`,
            telefono: '555555555',
            correo: `pf${timestamp}@test.com`,
            direccion: 'Camino Real 1',
            imagen_cedula_identidad: 'base64_cedula_pf',
            imagen_certificado: 'base64_cert_pf_nuevo', // Nuevo campo
            status: 'ACTIVO'
        };

        await PasajeroFrecuente.destroy({ where: { rut: '10.100.100-3' }, force: true });

        const pf = await PasajeroFrecuente.create(pfData);
        console.log('✅ Pasajero Frecuente creado ID:', pf.id);

        // Reload to ensure db persistence
        await pf.reload();

        console.log('   Imagen CI:', pf.imagen_cedula_identidad);
        console.log('   Imagen Cert:', pf.imagen_certificado);

        if (pf.imagen_cedula_identidad !== pfData.imagen_cedula_identidad) throw new Error('PF: imagen_cedula_identidad mismatch');
        if (pf.imagen_certificado !== pfData.imagen_certificado) throw new Error('PF: imagen_certificado mismatch');

        // Cleanup
        await am.destroy({ force: true });
        await est.destroy({ force: true });
        await pf.destroy({ force: true });

        console.log('\n--- Todos los tests pasaron exitosamente ---');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en test:', error);
        process.exit(1);
    }
}

test();
