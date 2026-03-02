const { Evento } = require('./src/models');
async function test() {
  const evento = await Evento.findOne({ where: { numero_ticket: 'T-12345', tipo_evento: 'DEVOLUCION' }});
  if (evento) {
    console.log('Anterior:', evento.monto_devolucion);
    evento.monto_devolucion = 8888;
    await evento.save();
    console.log('Nuevo:', evento.monto_devolucion);
  }
  process.exit(0);
}
test();
