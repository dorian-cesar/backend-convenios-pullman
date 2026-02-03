const { Evento, Usuario, Pasajero, Empresa, Convenio, CodigoDescuento, Descuento, TipoPasajero } = require('../models');
const { sequelize } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const descuentoService = require('./descuento.service');
const convenioService = require('./convenio.service');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

/**
 * Calcular monto con descuento
 */
const calcularMontoConDescuento = (tarifaBase, porcentajeDescuento) => {
  if (!porcentajeDescuento) return tarifaBase;
  const descuento = (tarifaBase * porcentajeDescuento) / 100;
  return tarifaBase - descuento;
};

/**
 * Crear evento (COMPRA)
 */
exports.crearEvento = async (data) => {
  const {
    usuario_id,
    pasajero_id,
    empresa_id,
    convenio_id,
    codigo_descuento_id,
    ciudad_origen,
    ciudad_destino,
    fecha_viaje,
    numero_asiento,
    tarifa_base
  } = data;

  // Validaciones
  if (!usuario_id || !pasajero_id || !empresa_id || !ciudad_origen || !ciudad_destino || !fecha_viaje || !tarifa_base) {
    throw new BusinessError('Faltan campos obligatorios');
  }

  // Verificar que existan las entidades relacionadas
  const usuario = await Usuario.findByPk(usuario_id);
  if (!usuario) throw new NotFoundError('Usuario no encontrado');

  const pasajero = await Pasajero.findByPk(pasajero_id);
  if (!pasajero) throw new NotFoundError('Pasajero no encontrado');

  const empresa = await Empresa.findByPk(empresa_id);
  if (!empresa) throw new NotFoundError('Empresa no encontrada');

  if (convenio_id) {
    const convenio = await Convenio.findByPk(convenio_id);
    if (!convenio) throw new NotFoundError('Convenio no encontrado');
  }

  // Calcular descuento usando el servicio central
  const pasajeroObj = await Pasajero.findByPk(pasajero_id);
  const aplicable = await descuentoService.obtenerDescuentoAplicable({
    convenioId: convenio_id,
    codigoDescuentoId: codigo_descuento_id,
    tipoPasajeroId: pasajeroObj ? pasajeroObj.tipo_pasajero_id : null
  });
  const porcentajeDescuento = aplicable ? aplicable.porcentaje_descuento : 0;
  const montoPagado = calcularMontoConDescuento(tarifa_base, porcentajeDescuento);

  // Verificar topes de convenio antes de crear
  if (convenio_id) {
    await convenioService.verificarLimites(convenio_id, montoPagado);
  }

  const evento = await Evento.create({
    tipo_evento: 'COMPRA',
    evento_origen_id: null,
    usuario_id,
    pasajero_id,
    empresa_id,
    convenio_id,
    codigo_descuento_id,
    ciudad_origen,
    ciudad_destino,
    fecha_viaje,
    numero_asiento,
    tarifa_base,
    porcentaje_descuento_aplicado: porcentajeDescuento,
    monto_pagado: montoPagado,
    monto_devolucion: null,
    is_deleted: false
  });

  return await Evento.findByPk(evento.id, {
    include: [
      { model: Usuario, attributes: ['id', 'correo'] },
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] }
    ]
  });
};

/**
 * Crear cambio de evento
 */
exports.crearCambio = async (data) => {
  const {
    evento_origen_id,
    usuario_id,
    ciudad_origen,
    ciudad_destino,
    fecha_viaje,
    numero_asiento,
    tarifa_base
  } = data;

  if (!evento_origen_id) {
    throw new BusinessError('evento_origen_id es obligatorio para CAMBIO');
  }

  // Verificar que el evento origen existe y es una COMPRA
  const eventoOrigen = await Evento.findByPk(evento_origen_id);
  if (!eventoOrigen) {
    throw new NotFoundError('Evento origen no encontrado');
  }

  if (eventoOrigen.tipo_evento !== 'COMPRA') {
    throw new BusinessError('Solo se pueden cambiar eventos de tipo COMPRA');
  }

  // Calcular diferencia de precio usando el servicio central
  const pasajeroObj = await Pasajero.findByPk(eventoOrigen.pasajero_id);
  const aplicable = await descuentoService.obtenerDescuentoAplicable({
    convenioId: eventoOrigen.convenio_id,
    codigoDescuentoId: eventoOrigen.codigo_descuento_id,
    tipoPasajeroId: pasajeroObj ? pasajeroObj.tipo_pasajero_id : null
  });
  const porcentajeDescuento = aplicable ? aplicable.porcentaje_descuento : 0;

  const nuevoMonto = calcularMontoConDescuento(tarifa_base, porcentajeDescuento);
  const montoPagado = nuevoMonto - eventoOrigen.monto_pagado;

  const evento = await Evento.create({
    tipo_evento: 'CAMBIO',
    evento_origen_id,
    usuario_id: usuario_id || eventoOrigen.usuario_id,
    pasajero_id: eventoOrigen.pasajero_id,
    empresa_id: eventoOrigen.empresa_id,
    convenio_id: eventoOrigen.convenio_id,
    codigo_descuento_id: eventoOrigen.codigo_descuento_id,
    ciudad_origen,
    ciudad_destino,
    fecha_viaje,
    numero_asiento,
    tarifa_base,
    porcentaje_descuento_aplicado: porcentajeDescuento,
    monto_pagado: montoPagado,
    monto_devolucion: null,
    is_deleted: false
  });

  return await Evento.findByPk(evento.id, {
    include: [
      { model: Usuario, attributes: ['id', 'correo'] },
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] },
      { model: Evento, as: 'EventoOrigen', attributes: ['id', 'tipo_evento', 'fecha_viaje', 'ciudad_origen', 'ciudad_destino'] }
    ]
  });
};

/**
 * Crear devolución de evento
 */
exports.crearDevolucion = async (data) => {
  const { evento_origen_id, usuario_id, monto_devolucion } = data;

  if (!evento_origen_id) {
    throw new BusinessError('evento_origen_id es obligatorio para DEVOLUCION');
  }

  // Verificar que el evento origen existe
  const eventoOrigen = await Evento.findByPk(evento_origen_id);
  if (!eventoOrigen) {
    throw new NotFoundError('Evento origen no encontrado');
  }

  if (eventoOrigen.tipo_evento !== 'COMPRA') {
    throw new BusinessError('Solo se pueden devolver eventos de tipo COMPRA');
  }

  const evento = await Evento.create({
    tipo_evento: 'DEVOLUCION',
    evento_origen_id,
    usuario_id: usuario_id || eventoOrigen.usuario_id,
    pasajero_id: eventoOrigen.pasajero_id,
    empresa_id: eventoOrigen.empresa_id,
    convenio_id: eventoOrigen.convenio_id,
    codigo_descuento_id: eventoOrigen.codigo_descuento_id,
    ciudad_origen: eventoOrigen.ciudad_origen,
    ciudad_destino: eventoOrigen.ciudad_destino,
    fecha_viaje: eventoOrigen.fecha_viaje,
    numero_asiento: eventoOrigen.numero_asiento,
    tarifa_base: eventoOrigen.tarifa_base,
    porcentaje_descuento_aplicado: eventoOrigen.porcentaje_descuento_aplicado,
    monto_pagado: null,
    monto_devolucion: monto_devolucion || eventoOrigen.monto_pagado,
    is_deleted: false
  });

  return await Evento.findByPk(evento.id, {
    include: [
      { model: Usuario, attributes: ['id', 'correo'] },
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] },
      { model: Evento, as: 'EventoOrigen', attributes: ['id', 'tipo_evento', 'fecha_viaje', 'ciudad_origen', 'ciudad_destino', 'monto_pagado'] }
    ]
  });
};

/**
 * Listar eventos
 */
exports.listarEventos = async (filters = {}) => {
  const { page, limit, sortBy, order, status, ...otherFilters } = filters;
  const { offset, limit: limitVal } = getPagination(page, limit);
  const where = { is_deleted: false };

  if (status) {
    where.status = status;
  }

  if (otherFilters.tipo_evento) {
    where.tipo_evento = otherFilters.tipo_evento;
  }

  if (otherFilters.empresa_id) {
    where.empresa_id = otherFilters.empresa_id;
  }

  if (otherFilters.pasajero_id) {
    where.pasajero_id = otherFilters.pasajero_id;
  }

  if (otherFilters.convenio_id) {
    where.convenio_id = otherFilters.convenio_id;
  }

  const sortField = sortBy || 'fecha_viaje';
  const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

  const data = await Evento.findAndCountAll({
    where,
    include: [
      { model: Usuario, attributes: ['id', 'correo'] },
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] },
      { model: Evento, as: 'EventoOrigen', attributes: ['id', 'tipo_evento', 'fecha_viaje'] }
    ],
    order: [[sortField, sortOrder]],
    limit: limitVal,
    offset
  });

  return getPagingData(data, page, limitVal);
};

/**
 * Obtener evento por ID
 */
exports.obtenerEvento = async (id) => {
  const evento = await Evento.findByPk(id, {
    include: [
      { model: Usuario, attributes: ['id', 'correo'] },
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] },
      { model: Evento, as: 'EventoOrigen', attributes: ['id', 'tipo_evento', 'fecha_viaje', 'ciudad_origen', 'ciudad_destino', 'monto_pagado'] }
    ]
  });

  if (!evento) {
    throw new NotFoundError('Evento no encontrado');
  }

  return evento;
};

/**
 * Eliminar evento (soft delete)
 */
exports.eliminarEvento = async (id) => {
  const evento = await Evento.findByPk(id);

  if (!evento) {
    throw new NotFoundError('Evento no encontrado');
  }

  evento.is_deleted = true;
  await evento.save();

  return evento;
};
/**
 * Obtener eventos por RUT de pasajero
 */
exports.obtenerEventosPorRut = async (rut, filters = {}) => {
  const { page, limit, sortBy, order } = filters;
  const { offset, limit: limitVal } = getPagination(page, limit);

  // 1. Buscar pasajero por RUT
  const pasajero = await Pasajero.findOne({ where: { rut } });

  if (!pasajero) {
    throw new NotFoundError('Pasajero no encontrado');
  }

  const sortField = sortBy || 'fecha_viaje';
  const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

  // 2. Buscar eventos usando el ID del pasajero
  const data = await Evento.findAndCountAll({
    where: {
      pasajero_id: pasajero.id,
      is_deleted: false
    },
    include: [
      { model: Usuario, attributes: ['id', 'correo'] },
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] },
      { model: Evento, as: 'EventoOrigen', attributes: ['id', 'tipo_evento', 'fecha_viaje'] }
    ],
    order: [[sortField, sortOrder]],
    limit: limitVal,
    offset
  });

  return getPagingData(data, page, limitVal);
};
