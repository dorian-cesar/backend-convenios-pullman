require('dotenv').config();
const { sequelize, Evento, Empresa, Pasajero, Convenio } = require('./src/models');
const eventosService = require('./src/services/eventos.service');
const EventoDTO = require('./src/dtos/evento.dto');

process.env.TZ = 'America/Santiago';

async function test() {
    await sequelize.authenticate();

    const idPrefix = Date.now().toString().slice(-6);
    const empresa = await Empresa.create({ nombre: 'TestEmpresa ' + idPrefix, rut_empresa: idPrefix + '-K', email_contacto: 't@t.com', representante_legal: 'T', telefono: '123' });
    const typePas = await sequelize.models.TipoPasajero.findOne();
    const pasajero = await Pasajero.create({ rut: idPrefix + '-1', nombres: 'T', apellidos: 'T', empresa_id: empresa.id, tipo_pasajero_id: typePas.id, is_active: true });
    const convenio = await Convenio.create({ nombre: 'Test', empresa_id: empresa.id, status: 'ACTIVO', api_consulta_id: 1, is_active: true });

    const payload = {
        pasajero_id: pasajero.id,
        empresa_id: empresa.id,
        convenio_id: convenio.id,
        ciudad_origen: 'Santiago',
        ciudad_destino: 'Puerto Montt',
        fecha_viaje: '2026-02-25',
        hora_salida: '23:30',
        terminal_origen: 'Terminal',
        terminal_destino: 'Terminal',
        numero_asiento: '1',
        numero_ticket: 'T' + idPrefix,
        pnr: 'P' + idPrefix,
        tarifa_base: 100,
        codigo_autorizacion: '12',
        token: 'tok',
        estado: 'confirmado',
        tipo_pago: 'efectivo'
    };

    const evento = await eventosService.crearCompraEvento(payload);

    // Verify what DB saved natively
    const [dbResult] = await sequelize.query(`SELECT fecha_evento, fecha_viaje FROM eventos WHERE id = ${evento.id}`);

    // Print results
    console.log("Raw DB Result:", dbResult[0]);
    console.log("Sequelize Object.fecha_evento (Tipo de dato):", typeof evento.fecha_evento, evento.fecha_evento);

    const dto = new EventoDTO(evento);
    console.log("DTO output raw:", dto.fecha_evento);

    await Evento.destroy({ where: { id: evento.id }, force: true });
    await Convenio.destroy({ where: { id: convenio.id }, force: true });
    await Pasajero.destroy({ where: { id: pasajero.id }, force: true });
    await Empresa.destroy({ where: { id: empresa.id }, force: true });

    process.exit(0);
}
test().catch(err => {
    console.error(err);
    process.exit(1);
});
