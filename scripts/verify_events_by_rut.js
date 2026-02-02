const { sequelize, Pasajero, Evento, Empresa, Usuario } = require('../src/models');
const eventosService = require('../src/services/eventos.service');

async function verify() {
    try {
        console.log('--- Verifying Events by RUT ---');

        console.log('1. Creating Prerequisites...');
        let empresa = await Empresa.findOne();
        if (!empresa) empresa = await Empresa.create({ nombre: 'Test Ent', rut_empresa: '88888888-8', status: 'ACTIVO' });

        let usuario = await Usuario.findOne();
        if (!usuario) usuario = await Usuario.create({ nombre: 'Test User', corre: 'test2@test.com', empresa_id: empresa.id });

        // Valid RUT for test
        const testRut = '55555555-5';
        // Cleanup if exists
        await Pasajero.destroy({ where: { rut: testRut } });

        const pasajero = await Pasajero.create({
            rut: testRut,
            nombres: 'Rut',
            apellidos: 'Tester',
            empresa_id: empresa.id,
            status: 'ACTIVO'
        });

        console.log(`Pasajero created: ${pasajero.id} - ${pasajero.rut}`);

        console.log('2. Creating Events...');
        await Evento.create({
            tipo_evento: 'COMPRA',
            usuario_id: usuario.id,
            pasajero_id: pasajero.id,
            empresa_id: empresa.id,
            ciudad_origen: 'A',
            ciudad_destino: 'B',
            fecha_viaje: new Date(),
            tarifa_base: 1000,
            status: 'ACTIVO'
        });

        await Evento.create({
            tipo_evento: 'COMPRA',
            usuario_id: usuario.id,
            pasajero_id: pasajero.id,
            empresa_id: empresa.id,
            ciudad_origen: 'B',
            ciudad_destino: 'C',
            fecha_viaje: new Date(),
            tarifa_base: 2000,
            status: 'ACTIVO'
        });

        console.log('3. Calling Service...');
        const result = await eventosService.obtenerEventosPorRut(testRut, {});

        console.log(`Found ${result.totalItems} events (Expected: 2)`);

        if (result.totalItems === 2) {
            console.log('SUCCESS: Events retrieved correctly.');
        } else {
            console.error('FAILURE: Incorrect number of events.');
        }

        // Cleanup
        const events = await Evento.findAll({ where: { pasajero_id: pasajero.id } });
        for (const e of events) {
            await e.destroy();
        }
        await pasajero.destroy();

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await sequelize.close();
    }
}

verify();
