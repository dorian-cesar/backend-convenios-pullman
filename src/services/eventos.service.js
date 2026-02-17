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
exports.obtenerEventoActual = async (eventoId) => {
  // Primero buscamos el historial para encontrar el último de la cadena
  const historial = await this.obtenerHistorialEventos(eventoId);
  if (historial.length === 0) {
    throw new NotFoundError('No se encontró historial para el evento');
  }
  return historial[0]; // El historial viene ordenado DESC por fecha_evento
};

/**
 * Obtener historial completo de la cadena de eventos
 */
exports.obtenerHistorialEventos = async (eventoId) => {
  const evento = await Evento.findByPk(eventoId);
  if (!evento) throw new NotFoundError('Evento no encontrado');

  // Buscamos la COMPRA original (raíz de la cadena)
  let compraOriginal = evento;
  while (compraOriginal.evento_origen_id) {
    compraOriginal = await Evento.findByPk(compraOriginal.evento_origen_id);
  }

  const cadena = [];
  let actual = await Evento.findOne({
    where: { evento_origen_id: null, id: compraOriginal.id },
    include: [
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] }
    ]
  });

  if (actual) cadena.push(actual);

  // Buscamos descendientes
  let tieneDescendientes = true;
  while (tieneDescendientes) {
    const descendiente = await Evento.findOne({
      where: { evento_origen_id: actual.id },
      include: [
        { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
        { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
        { model: Convenio, attributes: ['id', 'nombre'] }
      ]
    });
    if (descendiente) {
      cadena.push(descendiente);
      actual = descendiente;
    } else {
      tieneDescendientes = false;
    }
  }

  return cadena.reverse(); // De más reciente a más antiguo
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
    estado
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

  // Verificar topes de convenio
  if (convenio_id) {
    await convenioService.verificarLimites(convenio_id, montoPagado);
  }

  const evento = await Evento.create({
    tipo_evento: 'COMPRA',
    evento_origen_id: null,
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

  return await this.obtenerEvento(evento.id);
};

/**
 * Crear cambio de evento
 */
exports.crearCambioEvento = async (data) => {
  const {
    evento_origen_id: origenIdParam,
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
    estado
  } = data;

  // Automate origin detection if not provided
  let eventoOrigenId = origenIdParam;
  if (!eventoOrigenId) {
    const latestEvent = await findLatestEventByTicketOrPnr(numero_ticket, pnr);
    eventoOrigenId = latestEvent.id;
  }

  // 1. Obtener el evento origen (debe ser el ÚLTIMO de la cadena y no ser una DEVOLUCION)
  const eventoActual = await this.obtenerEventoActual(eventoOrigenId);

  if (eventoActual.tipo_evento === 'DEVOLUCION') {
    throw new EventoInvalidoError('No se puede realizar un CAMBIO sobre un evento que ya ha sido devuelto');
  }

  // 2. Validar que no haya sido ya cambiado
  const yaCambiado = await Evento.findOne({ where: { evento_origen_id: eventoActual.id } });
  if (yaCambiado) {
    throw new EventoInvalidoError('Este evento ya tiene una acción posterior vinculada');
  }

  // 3. Calcular montos
  const porcentajeDescuento = eventoActual.porcentaje_descuento_aplicado || 0;
  const nuevoMonto = calcularMontoConDescuento(tarifa_base, porcentajeDescuento);
  const diferenciaMonto = nuevoMonto - (eventoActual.monto_pagado || 0);

  const evento = await Evento.create({
    tipo_evento: 'CAMBIO',
    evento_origen_id: eventoActual.id,
    pasajero_id: eventoActual.pasajero_id,
    empresa_id: eventoActual.empresa_id,
    convenio_id: eventoActual.convenio_id,
    ciudad_origen,
    ciudad_destino,
    fecha_viaje,
    hora_salida,
    terminal_origen,
    terminal_destino,
    numero_asiento,
    numero_ticket: numero_ticket || eventoActual.numero_ticket,
    pnr: pnr || eventoActual.pnr,
    tarifa_base,
    porcentaje_descuento_aplicado: porcentajeDescuento,
    monto_pagado: diferenciaMonto,
    codigo_autorizacion,
    token,
    estado
  });

  return await this.obtenerEvento(evento.id);
};

/**
 * Crear devolución de evento
 */
exports.crearDevolucionEvento = async (data) => {
  const {
    evento_origen_id: origenIdParam,
    monto_devolucion,
    numero_ticket,
    pnr,
    codigo_autorizacion,
    token,
    estado
  } = data;

  // Automate origin detection if not provided
  let eventoOrigenId = origenIdParam;
  if (!eventoOrigenId) {
    const latestEvent = await findLatestEventByTicketOrPnr(numero_ticket, pnr);
    eventoOrigenId = latestEvent.id;
  }

  // 1. Obtener el evento actual (debe ser COMPRA o CAMBIO)
  const eventoActual = await this.obtenerEventoActual(eventoOrigenId);

  if (eventoActual.tipo_evento === 'DEVOLUCION') {
    throw new EventoYaDevueltoError('Este evento ya se encuentra devuelto');
  }

  // 2. Verificar que no haya sido ya procesado
  const yaProcesado = await Evento.findOne({ where: { evento_origen_id: eventoActual.id } });
  if (yaProcesado) {
    throw new EventoInvalidoError('No se puede devolver un evento que ya tiene acciones posteriores');
  }

  const evento = await Evento.create({
    tipo_evento: 'DEVOLUCION',
    evento_origen_id: eventoActual.id,
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
    codigo_autorizacion,
    token,
    estado
  });

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
      // If filtering by a RUT that doesn't exist, return empty result immediately
      return getPagingData({ count: 0, rows: [] }, page, limitVal);
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
    offset
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
      { model: Convenio, attributes: ['id', 'nombre'] },
      { model: Evento, as: 'EventoOrigen' }
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
