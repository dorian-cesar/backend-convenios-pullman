const { Pasajero, Evento, Convenio } = require('./src/models');

async function checkPassenger() {
    const rut = '19.992.889-9';
    const cleanRut = rut.replace(/\./g, ''); // 19992889-9
    
    console.log(`Checking for RUT: ${cleanRut}`);
    
    try {
        const pasajero = await Pasajero.findOne({
            where: { rut: cleanRut }
        });
        
        if (!pasajero) {
            console.log('Passenger not found with clean RUT');
            // Try with dots just in case
            const p2 = await Pasajero.findOne({ where: { rut: rut } });
            if (p2) console.log('Found passenger with DOTS (unexpected based on model validation)');
            else console.log('Passenger not found at all');
            return;
        }
        
        console.log('Passenger found:', {
            id: pasajero.id,
            rut: pasajero.rut,
            status: pasajero.status,
            convenio_id: pasajero.convenio_id
        });
        
        const eventos = await Evento.findAll({
            where: { pasajero_id: pasajero.id }
        });
        
        console.log(`Found ${eventos.length} events for this passenger`);
        eventos.forEach(e => {
            console.log(`- Event ID: ${e.id}, Tipo: ${e.tipo_evento}, Estado: ${e.estado}, PNR: ${e.pnr}, Ticket: ${e.numero_ticket}`);
        });

        // Check if there's any event with the provided PNR or Ticket
        const pnr = '2EEE34EDB8';
        const tkt = 'TS260506124031100IFUQ';
        
        const specificEvent = await Evento.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { pnr: pnr },
                    { numero_ticket: tkt }
                ]
            }
        });
        
        if (specificEvent) {
            console.log('Specific event found by PNR/TKT:', specificEvent.toJSON());
        } else {
            console.log('No specific event found by PNR or Ticket in our database');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkPassenger();
