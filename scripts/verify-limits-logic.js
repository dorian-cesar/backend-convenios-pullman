const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

const db = require('../src/models');
const { Evento, Convenio, Empresa, Pasajero } = db;
const convenioService = require('../src/services/convenio.service');
const eventosService = require('../src/services/eventos.service');

async function runVerification() {
    let convenioId;
    try {
        await db.sequelize.authenticate();
        console.log('DB Connected.');

        // 1. Create a test company
        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '99999999-9' },
            defaults: { nombre: 'Test Limit Corp', status: 'ACTIVO' }
        });

        // 2. Create a test passenger
        const [pasajero] = await Pasajero.findOrCreate({
            where: { rut: '11111111-1' },
            defaults: { nombres: 'Test', apellidos: 'User', correo: 'test@example.com' }
        });

        // 3. Create a test Convention with Limits (Max 2 tickets)
        const convenio = await Convenio.create({
            nombre: `Test Limit ${Date.now()}`,
            empresa_id: empresa.id,
            tipo: 'CODIGO_DESCUENTO',
            consumo_tickets: 0,
            consumo_monto: 0,
            tope_cantidad_tickets: 2,
            limitar_por_stock: true,
            status: 'ACTIVO',
            fecha_inicio: new Date(),
            fecha_termino: new Date(Date.now() + 86400000)
        });
        convenioId = convenio.id;
        console.log(`Created Convenio ID: ${convenio.id} with Max Tickets: 2`);

        // 4. Create Purchase 1 (Should Succeed)
        console.log('Attempting Purchase 1...');
        const evento1 = await eventosService.crearCompraEvento({
            pasajero_id: pasajero.id,
            empresa_id: empresa.id,
            convenio_id: convenio.id,
            ciudad_origen: 'Santiago',
            ciudad_destino: 'Valpo',
            fecha_viaje: new Date(),
            hora_salida: '10:00',
            terminal_origen: 'Sur',
            terminal_destino: 'Valpo',
            numero_asiento: '1',
            numero_ticket: `T-${Date.now()}-1`,
            tarifa_base: 5000,
            estado: 'confirmado'
        });
        console.log('Purchase 1 Success.');

        // Verify Consumption
        await convenio.reload();
        console.log(`Consumption after P1: Tickets=${convenio.consumo_tickets} (Expected 1)`);
        if (convenio.consumo_tickets !== 1) throw new Error('Consumption verification failed!');

        // 5. Create Purchase 2 (Should Succeed)
        console.log('Attempting Purchase 2...');
        const evento2 = await eventosService.crearCompraEvento({
            pasajero_id: pasajero.id,
            empresa_id: empresa.id,
            convenio_id: convenio.id,
            ciudad_origen: 'Santiago',
            ciudad_destino: 'Valpo',
            fecha_viaje: new Date(),
            hora_salida: '12:00',
            terminal_origen: 'Sur',
            terminal_destino: 'Valpo',
            numero_asiento: '2',
            numero_ticket: `T-${Date.now()}-2`,
            tarifa_base: 5000,
            estado: 'confirmado'
        });
        console.log('Purchase 2 Success.');

        // Verify Consumption
        await convenio.reload();
        console.log(`Consumption after P2: Tickets=${convenio.consumo_tickets} (Expected 2)`);
        if (convenio.consumo_tickets !== 2) throw new Error('Consumption verification failed!');

        // 6. Create Purchase 3 (Should Fail)
        console.log('Attempting Purchase 3 (Should Fail)...');
        try {
            await eventosService.crearCompraEvento({
                pasajero_id: pasajero.id,
                empresa_id: empresa.id,
                convenio_id: convenio.id,
                ciudad_origen: 'Santiago',
                ciudad_destino: 'Valpo',
                fecha_viaje: new Date(),
                hora_salida: '14:00',
                terminal_origen: 'Sur',
                terminal_destino: 'Valpo',
                numero_asiento: '3',
                numero_ticket: `T-${Date.now()}-3`,
                tarifa_base: 5000,
                estado: 'confirmado'
            });
            throw new Error('Purchase 3 succeeded! It SHOULD have failed.');
        } catch (error) {
            console.log(`Expected Error caught: ${error.message}`);
            if (!error.message.includes('Límite de cantidad de tickets excedido')) {
                throw new Error(`Unexpected error message: ${error.message}`);
            }
        }

        // 7. Refund Purchase 1
        console.log('Refund Purchase 1...');
        await eventosService.crearDevolucionEvento({
            evento_origen_id: evento1.id,
            monto_devolucion: 5000,
            estado: 'confirmado'
        });
        console.log('Refund Success.');

        // Verify Consumption Decrement
        await convenio.reload();
        console.log(`Consumption after Refund: Tickets=${convenio.consumo_tickets} (Expected 1)`);
        if (convenio.consumo_tickets !== 1) throw new Error('Refund Decrement failed!');

        console.log('ALL TESTS PASSED!');

    } catch (e) {
        console.error('Verification FAILED:', e);
        process.exit(1);
    } finally {
        // Cleanup
        if (convenioId) {
            // await Convenio.destroy({ where: { id: convenioId }, force: true });
        }
        process.exit(0);
    }
}

runVerification();
