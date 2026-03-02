require('dotenv').config();
const eventosService = require('./src/services/eventos.service');
const { sequelize } = require('./src/models');

async function check() {
    await sequelize.authenticate();
    const data = {
        pasajero_id: 67,
        empresa_id: 1,
        convenio_id: 1,
        ciudad_origen: 'Santiago',
        ciudad_destino: 'Puerto Montt',
        fecha_viaje: '2026-02-25',
        hora_salida: '23:30',
        terminal_origen: 'Terminal Sur',
        terminal_destino: 'Terminal 5566',
        numero_asiento: '1',
        numero_ticket: 'TEST_CRED_01',
        pnr: 'PNR_CRED_01',
        tarifa_base: 10000,
        codigo_autorizacion: '1213',
        token: 'token123',
        estado: 'confirmado',
        tipo_pago: 'credito',
        confirmed_pnrs: [ 'PNR1', 'PNR2', 'PNR3' ]
    };

    try {
        await eventosService.crearCompraEvento(data);
        console.log("Success");
    } catch(err) {
        console.error("Crash object:", err);
    }
    process.exit(0);
}
check();
