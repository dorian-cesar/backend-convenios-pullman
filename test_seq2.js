require('dotenv').config();
const { Evento } = require('./src/models');

async function run() {
    try {
        const evt = Evento.build({
            pasajero_id: 1,
            empresa_id: 1,
            ciudad_origen: "A",
            ciudad_destino: "B",
            fecha_viaje: { obj: 1 },
            fecha_evento: new Date().toISOString()
        });
        await evt.validate();
    } catch(err) {
        if(err.errors) {
            console.log(err.errors[0].message);
        } else {
            console.log(err);
        }
    }
}
run();
