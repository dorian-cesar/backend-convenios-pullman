const axios = require('axios');

async function testIndependentTables() {
    const baseURL = 'http://localhost:3000/api';
    const randomRut = () => `${Math.floor(Math.random() * 10000000)}-${Math.floor(Math.random() * 9)}`;

    console.log('🧪 Iniciando pruebas de tablas independientes...');

    try {
        // 1. Estudiante
        const rutEst = randomRut();
        console.log(`\n1️⃣  Creando Estudiante (RUT: ${rutEst})...`);
        const estRes = await axios.post(`${baseURL}/estudiantes`, {
            nombre: 'Juan Estudiante',
            rut: rutEst,
            telefono: '+56911111111',
            correo: 'juan.est@test.com',
            direccion: 'Calle 123',
            carnet_estudiante: 'TNE-2026',
            fecha_vencimiento: '2026-12-31',
            imagen_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        });
        console.log('✅ Estudiante creado:', estRes.data.id);

        // 2. Adulto Mayor
        const rutAm = randomRut();
        console.log(`\n2️⃣  Creando Adulto Mayor (RUT: ${rutAm})...`);
        const amRes = await axios.post(`${baseURL}/adultos-mayores`, {
            nombre: 'Maria Mayor',
            rut: rutAm,
            telefono: '+56922222222',
            correo: 'maria.am@test.com',
            direccion: 'Calle 456',
            certificado: 'CERT-001',
            fecha_emision: '2025-01-01',
            imagen_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        });
        console.log('✅ Adulto Mayor creado:', amRes.data.id);

        // 3. Pasajero Frecuente
        const rutPf = randomRut();
        console.log(`\n3️⃣  Creando Pasajero Frecuente (RUT: ${rutPf})...`);
        const pfRes = await axios.post(`${baseURL}/pasajeros-frecuentes`, {
            nombre: 'Pedro Frecuente',
            rut: rutPf,
            telefono: '+56933333333',
            correo: 'pedro.pf@test.com',
            direccion: 'Calle 789',
            codigo_frecuente: `PF-${Math.floor(Math.random() * 10000)}`,
            nivel: 'GOLD',
            imagen_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        });
        console.log('✅ Pasajero Frecuente creado:', pfRes.data.id);

        console.log('\n🎉 Todas las pruebas independientes finalizaron correctamente.');

    } catch (error) {
        console.error('\n❌ Error en las pruebas:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testIndependentTables();
