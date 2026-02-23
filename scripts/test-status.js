
const axios = require('axios');

async function testStatus() {
    const baseURL = 'http://localhost:3000/api';
    const rut = '9999999-9';

    try {
        console.log('🧪 Probando estado por defecto y activación...');

        // 1. Crear Estudiante
        console.log('\n1️⃣ Creando Estudiante...');
        const resCreate = await axios.post(`${baseURL}/estudiantes`, {
            nombre: 'Test Status',
            rut: rut,
            telefono: '999999999',
            correo: 'test@status.com',
            direccion: 'Calle Test 123',
            carnet_estudiante: 'ID-TEST',
            fecha_vencimiento: '2026-12-31'
        });
        const id = resCreate.data.id;
        console.log(`✅ Creado con ID: ${id}, Status: ${resCreate.data.status}`);

        if (resCreate.data.status !== 'INACTIVO') {
            console.error('❌ El status por defecto debería ser INACTIVO');
        }

        // 2. Activar Estudiante
        console.log('\n2️⃣ Activando Estudiante...');
        const resActivar = await axios.patch(`${baseURL}/estudiantes/activar/${id}`);
        console.log(`✅ Activado, Nuevo Status: ${resActivar.data.status}`);

        if (resActivar.data.status !== 'ACTIVO') {
            console.error('❌ El status debería haber cambiado a ACTIVO');
        }

        // Limpiar
        await axios.delete(`${baseURL}/estudiantes/${id}`);
        console.log('\n🎉 Pruebas de estado finalizadas correctamente.');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response ? error.response.data : error.message);
    }
}

testStatus();
