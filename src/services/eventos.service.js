const { Evento, Pasajero, Empresa, Convenio } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const ReglaDeNegocioError = require('../exceptions/ReglaDeNegocioError');
const EventoInvalidoError = require('../exceptions/EventoInvalidoError');
const EventoYaDevueltoError = require('../exceptions/EventoYaDevueltoError');
const convenioService = require('./convenio.service');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const { Op } = require('sequelize');

/**
 * Calcular monto con descuento
 */
const calcularMontoConDescuento = (tarifaBase, porcentajeDescuento) => {
  if (!porcentajeDescuento) return tarifaBase;
  const descuento = (tarifaBase * porcentajeDescuento) / 100;
  return Math.round(tarifaBase - descuento);
};

/**
 * Helper: Find latest event by Ticket or PNR
 */
const findLatestEventByTicketOrPnr = async (numero_ticket, pnr) => {
  if (!numero_ticket && !pnr) {
    throw new BusinessError('Debe proporcionar numero_ticket o pnr para identificar el evento origen');
  }

  const where = {};
  if (numero_ticket) where.numero_ticket = numero_ticket;
  if (pnr) where.pnr = pnr;

  // Find the most recent event matching these criteria
  const evento = await Evento.findOne({
    where,
    order: [['fecha_evento', 'DESC'], ['id', 'DESC']]
  });

  if (!evento) {
    throw new NotFoundError('No se encontró ningún evento con los datos proporcionados (Ticket/PNR)');
  }

  return evento;
};

/**
 * Obtener el estado actual de la cadena de eventos para un ticket/PNR
 * (El último evento válido no eliminado)
 */
exports.obtenerEventoActual = async (identifier) => {
  // identifier can be eventId or criteria
  const historial = await this.obtenerHistorialEventos(identifier);
  if (historial.length === 0) {
    throw new NotFoundError('No se encontró historial para el evento');
  }
  // Historial is ASC (0 is oldest), so verify last element
  return historial[historial.length - 1];
};

/**
 * Obtener historial completo de la cadena de eventos
 */
/**
 * Obtener historial completo de la cadena de eventos (Agrupado por Ticket/PNR) and ordered ASC (oldest first)
 */
exports.obtenerHistorialEventos = async (identifier) => {
  // identifier can be eventId (integer) or an object { numero_ticket, pnr }

  let whereClause = {};

  if (typeof identifier === 'number') {
    const currentParams = await Evento.findByPk(identifier, { attributes: ['numero_ticket', 'pnr'] });
    if (!currentParams) throw new NotFoundError('Evento no encontrado');

    if (currentParams.numero_ticket) whereClause.numero_ticket = currentParams.numero_ticket;
    else if (currentParams.pnr) whereClause.pnr = currentParams.pnr;
    else return []; // No traceable info
  } else {
    // It's already the criteria
    if (identifier.numero_ticket) whereClause.numero_ticket = identifier.numero_ticket;
    else if (identifier.pnr) whereClause.pnr = identifier.pnr;
    else throw new BusinessError('Debe proporcionar Ticket o PNR');
  }

  // Fetch all events with same Ticket/PNR
  const eventos = await Evento.findAll({
    where: whereClause,
    include: [
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] }
    ],
    order: [['fecha_evento', 'ASC'], ['id', 'ASC']],
    attributes: [
      'id', 'tipo_evento', 'tipo_pago', 'pasajero_id', 'empresa_id', 'convenio_id',
      'ciudad_origen', 'ciudad_destino', 'fecha_viaje', 'numero_asiento', 'numero_ticket',
      'pnr', 'hora_salida', 'terminal_origen', 'terminal_destino', 'tarifa_base',
      'porcentaje_descuento_aplicado', 'monto_pagado', 'monto_devolucion', 'fecha_evento',
      'codigo_autorizacion', 'token', 'estado', 'createdAt', 'updatedAt'
    ]
  });

  return eventos;
};

/**
 * Crear evento (COMPRA)
 */
exports.crearCompraEvento = async (data) => {
  const {
    pasajero_id,
    empresa_id,
    convenio_id,
    ciudad_origen,
    ciudad_destino,
    fecha_viaje,
    hora_salida,
    terminal_origen,
    terminal_destino,
    numero_asiento,
    numero_ticket,
    pnr,
    tarifa_base,
    codigo_autorizacion,
    token,
    estado,
    tipo_pago
  } = data;

  const pasajero = await Pasajero.findByPk(pasajero_id);
  if (!pasajero) throw new NotFoundError('Pasajero no encontrado');

  const empresa = await Empresa.findByPk(empresa_id);
  if (!empresa) throw new NotFoundError('Empresa no encontrada');

  let porcentajeDescuento = 0;
  if (convenio_id) {
    const convenio = await Convenio.findByPk(convenio_id);
    if (!convenio) throw new NotFoundError('Convenio no encontrado');
    if (convenio.status === 'ACTIVO') {
      porcentajeDescuento = convenio.porcentaje_descuento || 0;
    }
  }

  const montoPagado = calcularMontoConDescuento(tarifa_base, porcentajeDescuento);

  // (REMOVED) Verificar topes de convenio: A petición del negocio ya no se valida stock/monto al comprar,
  // solo se registra el consumo posteriormente.

  const evento = await Evento.create({
    tipo_evento: 'COMPRA',
    tipo_pago,
    // evento_origen_id removed
    pasajero_id,
    empresa_id,
    convenio_id,
    ciudad_origen,
    ciudad_destino,
    fecha_viaje,
    hora_salida,
    terminal_origen,
    terminal_destino,
    numero_asiento,
    numero_ticket,
    pnr,
    tarifa_base,
    porcentaje_descuento_aplicado: porcentajeDescuento,
    monto_pagado: montoPagado,
    codigo_autorizacion,
    token,
    estado
  });

  /* 
  // -- RE-PARSING --
  // Actualizar contadores del convenio si corresponde
  if (convenio_id && estado === 'confirmado') {
    const convenio = await Convenio.findByPk(convenio_id);
    if (convenio) {
      const descuento = (tarifa_base || 0) - (montoPagado !== null ? montoPagado : 0);
      // Si tarifa_base es negativa, estamos frente a una devolución por esta misma vía
      // Por ende, sumamos -1 al consumo de tickets (dando 1 ticket de vuelta disponible)
      const ticketsASumar = (tarifa_base < 0) ? -1 : 1;

      await convenio.increment({
        'consumo_tickets': ticketsASumar,
        'consumo_monto_descuento': descuento
      });
    }
  }
  */

  return await this.obtenerEvento(evento.id);
};

/**
 * Crear devolución de evento
 */
exports.crearDevolucionEvento = async (data) => {
  const {
    numero_ticket,
    pnr,
    monto_devolucion,
    codigo_autorizacion,
    token,
    estado,
    status,
    tipo_pago
  } = data;

  const finalEstado = estado || status;

  if (!numero_ticket && !pnr) {
    throw new BusinessError('Debe proporcionar numero_ticket o pnr para realizar una devolución');
  }

  // 1. Obtener el evento actual (debe ser COMPRA)
  // We pass the criteria object directly
  const criteria = {};
  if (numero_ticket) criteria.numero_ticket = numero_ticket;
  if (pnr) criteria.pnr = pnr;

  const eventoActual = await this.obtenerEventoActual(criteria);

  // Get the complete history to find the original COMPRA
  const historial = await this.obtenerHistorialEventos(criteria);
  const eventoCompra = historial.find(e => e.tipo_evento === 'COMPRA') || eventoActual;

  if (eventoActual.tipo_evento === 'DEVOLUCION') {
    // Si ya existe un evento de devolución, lo actualizamos (comportamiento PATCH)
    const devolucionGuardada = await Evento.findByPk(eventoActual.id);
    if (monto_devolucion !== undefined) devolucionGuardada.monto_devolucion = monto_devolucion;
    if (codigo_autorizacion !== undefined) devolucionGuardada.codigo_autorizacion = codigo_autorizacion;
    if (token !== undefined) devolucionGuardada.token = token;
    if (finalEstado !== undefined) devolucionGuardada.estado = finalEstado;
    if (tipo_pago !== undefined) devolucionGuardada.tipo_pago = tipo_pago;

    // Restaurar los campos faltantes de la compra original si es que se habían puesto en nulo
    if (!devolucionGuardada.tipo_pago) devolucionGuardada.tipo_pago = eventoCompra.tipo_pago;
    if (!devolucionGuardada.codigo_autorizacion) devolucionGuardada.codigo_autorizacion = eventoCompra.codigo_autorizacion;
    if (!devolucionGuardada.token) devolucionGuardada.token = eventoCompra.token;
    if (!devolucionGuardada.estado) devolucionGuardada.estado = eventoCompra.estado;

    await devolucionGuardada.save();
    return await this.obtenerEvento(devolucionGuardada.id);
  }

  // 2. Verificar que no haya sido ya procesado (si ya existe una devolucion en el historial)
  // Since obtenerEventoActual returns the LAST event, if it is PAYMENT/COMPRA, we are good.
  // But double check if there are newer events just in case (race conditions, though unlikely with this logic)

  const evento = await Evento.create({
    tipo_evento: 'DEVOLUCION',
    pasajero_id: eventoActual.pasajero_id,
    empresa_id: eventoActual.empresa_id,
    convenio_id: eventoActual.convenio_id,
    ciudad_origen: eventoActual.ciudad_origen,
    ciudad_destino: eventoActual.ciudad_destino,
    fecha_viaje: eventoActual.fecha_viaje,
    hora_salida: eventoActual.hora_salida,
    terminal_origen: eventoActual.terminal_origen,
    terminal_destino: eventoActual.terminal_destino,
    numero_asiento: eventoActual.numero_asiento,
    numero_ticket: numero_ticket || eventoActual.numero_ticket,
    pnr: pnr || eventoActual.pnr,
    tarifa_base: eventoActual.tarifa_base,
    porcentaje_descuento_aplicado: eventoActual.porcentaje_descuento_aplicado,
    monto_pagado: 0,
    monto_devolucion: monto_devolucion,
    tipo_pago: tipo_pago !== undefined ? tipo_pago : (eventoActual.tipo_pago || eventoCompra.tipo_pago),
    codigo_autorizacion: codigo_autorizacion !== undefined ? codigo_autorizacion : (eventoActual.codigo_autorizacion || eventoCompra.codigo_autorizacion),
    token: token !== undefined ? token : (eventoActual.token || eventoCompra.token),
    estado: finalEstado !== undefined ? finalEstado : (eventoActual.estado || eventoCompra.estado)
  });

  /* 
  // Actualizar contadores del convenio si corresponde (Reversar consumo)
  if (evento.convenio_id && finalEstado === 'confirmado') {
    const convenio = await Convenio.findByPk(evento.convenio_id);
    if (convenio) {
      const descuentoOriginal = (eventoActual.tarifa_base || 0) - (eventoActual.monto_pagado !== null ? eventoActual.monto_pagado : 0);
      await convenio.decrement({
        'consumo_tickets': 1,
        'consumo_monto_descuento': descuentoOriginal
      });
    }
  }
  */

  return await this.obtenerEvento(evento.id);
};

/**
 * Listar eventos (con paginación y filtros)
 */
exports.listarEventos = async (filters = {}) => {
  const { page, limit, sortBy, order, ...otherFilters } = filters;
  const { offset, limit: limitVal } = getPagination(page, limit);
  const where = {};

  if (otherFilters.rut) {
    const pasajero = await Pasajero.findOne({ where: { rut: otherFilters.rut } });
    if (pasajero) {
      where.pasajero_id = pasajero.id;
    } else {
      // If filtering by a RUT that doesn't exist, throw 404 as requested
      throw new NotFoundError(`No se encontró el pasajero con RUT: ${otherFilters.rut}`);
    }
  }

  if (otherFilters.tipo_evento) where.tipo_evento = otherFilters.tipo_evento;
  if (otherFilters.empresa_id) where.empresa_id = otherFilters.empresa_id;
  if (otherFilters.pasajero_id) where.pasajero_id = otherFilters.pasajero_id;
  if (otherFilters.convenio_id) where.convenio_id = otherFilters.convenio_id;
  if (otherFilters.pnr) where.pnr = otherFilters.pnr;
  if (otherFilters.numero_ticket) where.numero_ticket = otherFilters.numero_ticket;

  const sortField = sortBy || 'fecha_evento';
  const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

  const data = await Evento.findAndCountAll({
    where,
    include: [
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] }
    ],
    order: [[sortField, sortOrder]],
    limit: limitVal,
    order: [[sortField, sortOrder]],
    limit: limitVal,
    offset,
    attributes: [
      'id', 'tipo_evento', 'tipo_pago', 'pasajero_id', 'empresa_id', 'convenio_id',
      'ciudad_origen', 'ciudad_destino', 'fecha_viaje', 'numero_asiento', 'numero_ticket',
      'pnr', 'hora_salida', 'terminal_origen', 'terminal_destino', 'tarifa_base',
      'porcentaje_descuento_aplicado', 'monto_pagado', 'monto_devolucion', 'fecha_evento',
      'codigo_autorizacion', 'token', 'estado', 'createdAt', 'updatedAt'
    ]
  });

  return getPagingData(data, page, limitVal);
};

/**
 * Obtener evento por ID (con relaciones)
 */
exports.obtenerEvento = async (id) => {
  const evento = await Evento.findByPk(id, {
    include: [
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] }
    ]
  });

  if (!evento) throw new NotFoundError('Evento no encontrado');
  return evento;
};

/**
 * Listar por RUT (auxiliar)
 */
exports.obtenerEventosPorRut = async (rut, filters = {}) => {
  const pasajero = await Pasajero.findOne({ where: { rut } });
  if (!pasajero) throw new NotFoundError('Pasajero no encontrado');
  return this.listarEventos({ ...filters, pasajero_id: pasajero.id });
};

/**
 * Eliminar (Soft delete) - Solo permitido administrativamente si aplica
 */
exports.eliminarEvento = async (id) => {
  const evento = await Evento.findByPk(id);
  if (!evento) throw new NotFoundError('Evento no encontrado');

  await evento.destroy();
  return evento;
};
