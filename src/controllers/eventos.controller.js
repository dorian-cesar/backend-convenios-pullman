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
    const result = await eventosService.listarEventos(req.query);
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
    const response = {
      ...result,
      rows: EventoDTO.fromArray(result.rows)
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};
