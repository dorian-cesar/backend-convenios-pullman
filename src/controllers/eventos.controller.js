const eventosService = require('../services/eventos.service');
const EventoDTO = require('../dtos/evento.dto');

/**
 * Crear evento (COMPRA)
 */
exports.crearCompra = async (req, res, next) => {
  try {
    const evento = await eventosService.crearCompraEvento(req.body);
    res.status(201).json(new EventoDTO(evento));
  } catch (error) {
    next(error);
  }
};



/**
 * Crear devolución
 */
exports.crearDevolucion = async (req, res, next) => {
  try {
    const evento = await eventosService.crearDevolucionEvento(req.body);
    res.status(201).json(new EventoDTO(evento));
  } catch (error) {
    next(error);
  }
};

/**
 * Listar eventos
 */
exports.listar = async (req, res, next) => {
  try {
    // Extraemos todos los parámetros posibles para la búsqueda avanzada
    const { 
      page, limit, sortBy, order, 
      id, search, rut, pnr, numero_ticket, estado,
      startDate, endDate, tipo_evento, empresa_id, convenio_id
    } = req.query;

    const result = await eventosService.listarEventos({
      page, limit, sortBy, order, 
      id, search, rut, pnr, numero_ticket, estado,
      startDate, endDate, tipo_evento, empresa_id, convenio_id
    });

    const response = {
      ...result,
      rows: EventoDTO.fromArray(result.rows)
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener evento por ID
 */
exports.obtener = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evento = await eventosService.obtenerEvento(id);
    res.json(new EventoDTO(evento));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de eventos para una cadena
 */
exports.obtenerHistorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const historial = await eventosService.obtenerHistorialEventos(id);
    res.json(EventoDTO.fromArray(historial));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener el estado actual (último evento) de una cadena
 */
exports.obtenerEventoActual = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actual = await eventosService.obtenerEventoActual(id);
    res.json(new EventoDTO(actual));
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar evento (soft delete)
 */
exports.eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await eventosService.eliminarEvento(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Listar eventos por RUT de pasajero
 */
exports.listarPorRut = async (req, res, next) => {
  try {
    const { rut } = req.params;
    const result = await eventosService.obtenerEventosPorRut(rut, req.query);
    const response = {
      ...result,
      rows: EventoDTO.fromArray(result.rows)
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Buscar eventos por payload (RUT y PNR)
 */
exports.buscar = async (req, res, next) => {
  try {
    const { rut, pnr } = req.body;
    // Reuse listarEventos logic passing body as filters
    // We Map body params to filter params expected by service
    const filters = {
      rut,
      pnr,
      ...req.query // Allow pagination query params too if needed
    };

    const result = await eventosService.listarEventos(filters);
    
    // Sincronización en tiempo real con Kupos para los resultados encontrados
    if (result.rows && result.rows.length > 0) {
      for (let i = 0; i < result.rows.length; i++) {
        const evento = result.rows[i];
        
        const ticketConsultar = evento.numero_ticket || evento.pnr;
        if (ticketConsultar) {
          const kuposInfo = await eventosService.fetchTicketInfoFromKupos(ticketConsultar);
          if (kuposInfo) {
            let modified = false;
            
            // Sincronizar PNR
            if (kuposInfo.operator_pnr && evento.pnr !== kuposInfo.operator_pnr) {
              evento.pnr = kuposInfo.operator_pnr;
              modified = true;
            }
            // Sincronizar Estado
            if (kuposInfo.status && evento.estado !== kuposInfo.status) {
              if (kuposInfo.status === 'anulado') {
                // Respetar estados locales de error
                if (!['expirado', 'error_confirmacion', 'anulado'].includes(evento.estado)) {
                  evento.estado = 'anulado';
                  modified = true;
                }
              } else {
                evento.estado = kuposInfo.status;
                modified = true;
              }
            }
            
            // Si hubo cambios, impactar base de datos
            if (modified) {
              await eventosService.actualizarEstadoEvento(evento.id, evento.estado, evento.pnr);
            }
          }
        }
      }
    }

    const response = {
      ...result,
      rows: EventoDTO.fromArray(result.rows)
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};
