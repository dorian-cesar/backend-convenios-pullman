const { Evento, Usuario, Pasajero, Empresa, Convenio, CodigoDescuento, Descuento, TipoPasajero } = require('../models');
const { sequelize } = require('../models');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');

/**
 * Calcular monto con descuento
 */
const calcularMontoConDescuento = (tarifaBase, porcentajeDescuento) => {
  if (!porcentajeDescuento) return tarifaBase;
  const descuento = (tarifaBase * porcentajeDescuento) / 100;
  return tarifaBase - descuento;
};

/**
 * Obtener descuento aplicable
 */
const obtenerDescuentoAplicable = async (pasajeroId, convenioId, codigoDescuentoId) => {
  const pasajero = await Pasajero.findByPk(pasajeroId, {
    include: [{ model: TipoPasajero }]
  });

  if (!pasajero || !pasajero.TipoPasajero) {
    return 0;
  }

  // Buscar descuento por convenio y tipo de pasajero
  if (convenioId) {
    const descuento = await Descuento.findOne({
      where: {
        convenio_id: convenioId,
        tipo_pasajero_id: pasajero.tipo_pasajero_id,
        status: 'ACTIVO'
      }
    });

    if (descuento) {
      return descuento.porcentaje_descuento || 0;
    }
  }

  return 0;
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

  // Calcular descuento
  const porcentajeDescuento = await obtenerDescuentoAplicable(pasajero_id, convenio_id, codigo_descuento_id);
  const montoPagado = calcularMontoConDescuento(tarifa_base, porcentajeDescuento);

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

  // Calcular diferencia de precio
  const porcentajeDescuento = await obtenerDescuentoAplicable(
    eventoOrigen.pasajero_id,
    eventoOrigen.convenio_id,
    eventoOrigen.codigo_descuento_id
  );

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
  const where = { is_deleted: false };

  if (filters.tipo_evento) {
    where.tipo_evento = filters.tipo_evento;
  }

  if (filters.empresa_id) {
    where.empresa_id = filters.empresa_id;
  }

  if (filters.pasajero_id) {
    where.pasajero_id = filters.pasajero_id;
  }

  if (filters.convenio_id) {
    where.convenio_id = filters.convenio_id;
  }

  const eventos = await Evento.findAll({
    where,
    include: [
      { model: Usuario, attributes: ['id', 'correo'] },
      { model: Pasajero, attributes: ['id', 'rut', 'nombres', 'apellidos'] },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] },
      { model: Evento, as: 'EventoOrigen', attributes: ['id', 'tipo_evento', 'fecha_viaje'] }
    ],
    order: [['fecha_evento', 'DESC']]
  });

  return eventos;
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
