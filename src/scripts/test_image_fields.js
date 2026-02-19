
const { Estudiante, AdultoMayor, PasajeroFrecuente } = require('../models');

async function verify() {
    try {
        console.log('--- Verificando Modelos y Nuevos Campos ---');

        // Estudiante
        console.log('Verificando Estudiante...');
        const e = await Estudiante.build({
            nombre: 'Test',
            rut: '1-9',
            telefono: '123',
            correo: 'test@test.com',
            direccion: 'Test',
            carnet_estudiante: 'Test',
            fecha_vencimiento: '2026-01-01',
            imagen_cedula_identidad: 'test_id',
            imagen_certificado_alumno_regular: 'test_cert'
        });
        console.log('  - Estudiante build exitoso');
        console.log('  - imagen_cedula_identidad:', e.imagen_cedula_identidad);
        console.log('  - imagen_certificado_alumno_regular:', e.imagen_certificado_alumno_regular);

        // AdultoMayor
        console.log('Verificando AdultoMayor...');
        const a = await AdultoMayor.build({
            nombre: 'Test',
            rut: '2-7',
            telefono: '123',
            correo: 'test@test.com',
            direccion: 'Test',
            certificado: 'Test',
            fecha_emision: '2026-01-01',
            imagen_cedula_identidad: 'test_id',
            imagen_certificado_residencia: 'test_cert'
        });
        console.log('  - AdultoMayor build exitoso');
        console.log('  - imagen_cedula_identidad:', a.imagen_cedula_identidad);
        console.log('  - imagen_certificado_residencia:', a.imagen_certificado_residencia);

        // PasajeroFrecuente
        console.log('Verificando PasajeroFrecuente...');
        const p = await PasajeroFrecuente.build({
            nombre: 'Test',
            rut: '3-5',
            telefono: '123',
            correo: 'test@test.com',
            direccion: 'Test',
            imagen_cedula_identidad: 'test_id'
        });
        console.log('  - PasajeroFrecuente build exitoso');
        console.log('  - imagen_cedula_identidad:', p.imagen_cedula_identidad);

        console.log('--- Verificación completada exitosamente ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        process.exit(1);
    }
}

verify();
