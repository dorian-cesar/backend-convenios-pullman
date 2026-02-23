
const { Evento, Pasajero, Empresa, Convenio } = require('../models');
const eventosService = require('../services/eventos.service');

async function verifyTraceability() {
    try {
        console.log('--- Verificando Trazabilidad por Ticket/PNR ---');

        // 1. Setup Data
        const TICKET_NUMBER = 'T-TRACE-' + Date.now();
        console.log('Ticket de prueba:', TICKET_NUMBER);

        const pasajero = await Pasajero.findByPk(1) || await Pasajero.create({
            id: 1, rut: '1-9', nombres: 'Test', apellidos: 'User',
            correo: 'test@test.com', telefono: '123', tipo_pasajero_id: 1, empresa_id: 1
        });
        const empresa = await Empresa.findByPk(1) || await Empresa.create({
            id: 1, nombre: 'Empresa Test', rut_empresa: '11.111.111-1'
        });

        // 2. Crear COMPRA
        console.log('Creando COMPRA...');
        const compra = await Evento.create({
            tipo_evento: 'COMPRA',
            tipo_pago: 'WEBPAY',
            pasajero_id: pasajero.id,
            empresa_id: empresa.id,
            ciudad_origen: 'Santiago',
            ciudad_destino: 'Valpo',
            fecha_viaje: '2026-03-01',
            tarifa_base: 10000,
            monto_pagado: 10000,
            numero_ticket: TICKET_NUMBER,
            estado: 'confirmado'
        });
        console.log('  - Compra creada ID:', compra.id);

        // 3. Crear DEVOLUCION via Servicio (usando lógica nueva)
        console.log('Creando DEVOLUCION via Service...');
        const devolucion = await eventosService.crearDevolucionEvento({
            numero_ticket: TICKET_NUMBER,
            monto_devolucion: 5000,
            estado: 'confirmado'
        });
        console.log('  - Devolución creada ID:', devolucion.id);

        // 4. Verificar Historial
        console.log('Obteniendo Historial...');
        const historial = await eventosService.obtenerHistorialEventos({ numero_ticket: TICKET_NUMBER });

        console.log(`  - Eventos encontrados: ${historial.length}`);

        const tieneCompra = historial.some(e => e.id === compra.id && e.tipo_evento === 'COMPRA');
        const tieneDev = historial.some(e => e.id === devolucion.id && e.tipo_evento === 'DEVOLUCION');

        if (historial.length === 2 && tieneCompra && tieneDev) {
            console.log('✅ Trazabilidad CORRECTA: Ambos eventos vinculados por Ticket.');
        } else {
            console.error('❌ Error en Trazabilidad:', historial.map(e => ({ id: e.id, tipo: e.tipo_evento })));
            process.exit(1);
        }

        // Cleanup
        await compra.destroy();
        await devolucion.destroy();
        console.log('Datos de prueba eliminados.');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
        process.exit(1);
    }
}

verifyTraceability();
