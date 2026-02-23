
const { Evento, Pasajero, Empresa, Convenio } = require('../models');

async function verifyTipoPago() {
    try {
        console.log('--- Verificando campo tipo_pago en Evento ---');

        // 1. Crear datos dummy si no existen (o usar existentes)
        // Para simplificar, intentaremos crear un evento con IDs 1, asumiendo que existen.
        // Si fallan las FK, tendremos que crear los padres.

        // Check preconditions
        const pasajero = await Pasajero.findByPk(1) || await Pasajero.create({
            id: 1, rut: '1-9', nombres: 'Test', apellidos: 'User',
            correo: 'test@test.com', telefono: '123', tipo_pasajero_id: 1, empresa_id: 1
        });

        const empresa = await Empresa.findByPk(1) || await Empresa.create({
            id: 1, nombre: 'Empresa Test', rut_empresa: '11.111.111-1'
        });

        const eventoData = {
            tipo_evento: 'COMPRA',
            tipo_pago: 'WEBPAY', // <--- TESTING THIS
            pasajero_id: pasajero.id,
            empresa_id: empresa.id,
            ciudad_origen: 'Test Origin',
            ciudad_destino: 'Test Dest',
            fecha_viaje: '2026-01-01',
            tarifa_base: 1000,
            estado: 'confirmado'
        };

        console.log('Creando evento con tipo_pago: WEBPAY...');
        const evento = await Evento.create(eventoData);

        console.log('Evento creado ID:', evento.id);
        console.log('tipo_pago guardado:', evento.tipo_pago);

        if (evento.tipo_pago === 'WEBPAY') {
            console.log('✅ Verificación EXITOSA: tipo_pago se guardó correctamente.');
        } else {
            console.error('❌ Verificación FALLIDA: tipo_pago no coincide.');
            process.exit(1);
        }

        // Cleanup
        await evento.destroy();
        console.log('Evento de prueba eliminado.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        process.exit(1);
    }
}

verifyTipoPago();
