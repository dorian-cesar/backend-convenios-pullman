const { Evento } = require('../src/models');
const { Op } = require('sequelize');

async function buscarCaso() {
  try {
    console.log('--- Buscando Caso Específico (Campos Correctos) ---');
    const pnr_buscado = '2EEE34EDB8';
    const tkt_buscado = 'TS260506124031100IFUQ';

    // Buscar por PNR o TKT en sus columnas específicas
    const evento = await Evento.findOne({
      where: {
        [Op.or]: [
          { pnr: pnr_buscado },
          { numero_ticket: tkt_buscado }
        ]
      }
    });

    if (evento) {
      console.log('✅ Registro encontrado en la tabla Eventos:');
      console.log('ID:', evento.id);
      console.log('Tipo:', evento.tipo_evento);
      console.log('Fecha:', evento.createdAt);
      console.log('PNR:', evento.pnr);
      console.log('Ticket:', evento.numero_ticket);
      console.log('--- Respuesta Externa (Kupos/Konnec) ---');
      console.log(JSON.stringify(evento.respuesta_kupos, null, 2));
    } else {
      console.log('❌ No se encontró ningún registro con ese PNR o TKT en las columnas directas.');
      
      // Búsqueda más amplia en el JSON de respuesta por si acaso
      const eventoJson = await Evento.findOne({
        where: {
          respuesta_kupos: {
            [Op.like]: `%${pnr_buscado}%`
          }
        }
      });

      if (eventoJson) {
          console.log('✅ Encontrado dentro del JSON de respuesta_kupos:');
          console.log('ID:', eventoJson.id);
          console.log(JSON.stringify(eventoJson.respuesta_kupos, null, 2));
      } else {
          console.log('❌ Tampoco se encontró dentro del JSON de respuesta.');
      }
    }
  } catch (error) {
    console.error('Error en la búsqueda:', error);
  } finally {
    process.exit();
  }
}

buscarCaso();
