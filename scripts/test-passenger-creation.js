const axios = require('axios');

async function testPassengerCreation() {
    const baseURL = 'http://localhost:3000/api/pasajeros';

    // Generar RUT aleatorio para evitar colisiones
    const randomRut = () => `${Math.floor(Math.random() * 10000000)}-${Math.floor(Math.random() * 9)}`;

    console.log('🧪 Iniciando pruebas de creación de pasajeros...');

    try {
        // 1. Crear Pasajero REGULAR
        const rutRegular = randomRut();
        console.log(`\n1️⃣  Probando creación de REGULAR (RUT: ${rutRegular})...`);
        const regularRes = await axios.post(`${baseURL}/regular`, {
            rut: rutRegular,
            nombres: 'Juan',
            apellidos: 'Regular',
            fecha_nacimiento: '1990-01-01',
            correo: 'juan.regular@test.com',
            telefono: '+56911111111'
        });
        console.log('✅ REGULAR creado:', regularRes.data.id);
        // Verify response structure
        if (!regularRes.data.tipo_pasajero) console.error('⚠️ ALERTA: tipo_pasajero no incluido en respuesta');
        else console.log('   Tipo:', regularRes.data.tipo_pasajero.codigo);

        // 2. Crear Pasajero ESTUDIANTE
        const rutEstudiante = randomRut();
        console.log(`\n2️⃣  Probando creación de ESTUDIANTE (RUT: ${rutEstudiante})...`);
        const estRes = await axios.post(`${baseURL}/estudiante`, {
            rut: rutEstudiante,
            nombres: 'Maria',
            apellidos: 'Estudiante',
            fecha_nacimiento: '2005-01-01',
            correo: 'maria.est@test.com',
            telefono: '+56922222222',
            carnet_estudiante: 'TNE-2026',
            fecha_vencimiento: '2026-12-31',
            entidad_emisora: 'JUNAEB'
        });
        console.log('✅ ESTUDIANTE creado:', estRes.data.id);
        // Verify subtype data
        if (!estRes.data.estudiante) console.error('⚠️ ALERTA: No se devolvieron datos de estudiante adjuntos');
        else console.log('   Datos Estudiante:', estRes.data.estudiante);

        // 3. Crear Pasajero ADULTO MAYOR
        const rutAdulto = randomRut();
        console.log(`\n3️⃣  Probando creación de ADULTO MAYOR (RUT: ${rutAdulto})...`);
        const amRes = await axios.post(`${baseURL}/adulto-mayor`, {
            rut: rutAdulto,
            nombres: 'Pedro',
            apellidos: 'Mayor',
            fecha_nacimiento: '1950-01-01',
            correo: 'pedro.am@test.com',
            telefono: '+56933333333',
            certificado: 'CERT-SENAMA-001',
            fecha_emision: '2025-01-01'
        });
        console.log('✅ ADULTO MAYOR creado:', amRes.data.id);
        if (!amRes.data.adultoMayor) console.error('⚠️ ALERTA: No se devolvieron datos de adulto mayor adjuntos');
        else console.log('   Datos Adulto Mayor:', amRes.data.adultoMayor);

        console.log('\n🎉 Todas las pruebas de creación finalizaron correctamente.');

    } catch (error) {
        console.error('\n❌ Error en las pruebas:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testPassengerCreation();
