const eventosService = require('../services/eventos.service');
const EventoDTO = require('../dtos/evento.dto');

/**
 * Crear evento (COMPRA)
 */
exports.crearCompra = async (req, res, next) => {
  try {
    const evento = await eventosService.crearEvento(req.body);
    res.status(201).json(new EventoDTO(evento));
  } catch (error) {
    next(error);
  }
};

/**
 * Crear cambio
 */
exports.crearCambio = async (req, res, next) => {
  try {
    const evento = await eventosService.crearCambio(req.body);
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
    const evento = await eventosService.crearDevolucion(req.body);
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
    const eventos = await eventosService.listarEventos(req.query);
    res.json(EventoDTO.fromArray(eventos));
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
