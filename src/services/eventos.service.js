const { Evento, Pasajero, Empresa, Convenio, RegistroTablaClienteCorporativo, Fach, Carabinero, Estudiante, AdultoMayor, PasajeroFrecuente, sequelize } = require('../models');
const definirModeloDinamico = require('../utils/definirModeloDinamico');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const ReglaDeNegocioError = require('../exceptions/ReglaDeNegocioError');
const EventoInvalidoError = require('../exceptions/EventoInvalidoError');
const EventoYaDevueltoError = require('../exceptions/EventoYaDevueltoError');
const convenioService = require('./convenio.service');
const emailService = require('./email.service');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const { Op } = require('sequelize');
const axios = require('axios');

/**
 * Consulta Kupos para obtener información detallada del ticket (operator_pnr y status).
 * Retorna el objeto con los datos o null si falla / no existe.
 */
const fetchTicketInfoFromKupos = async (numeroTicket) => {
  if (!numeroTicket) return null;
  if (!process.env.KUPOS_API_KEY || !process.env.KUPOS_API_URL) return null;

  try {
    const response = await axios.get(process.env.KUPOS_API_URL, {
      params: { pnr_number: numeroTicket, api_key: process.env.KUPOS_API_KEY },
      timeout: 5000
    });
    const ticketDetails = response.data?.result?.ticket_details;
    if (ticketDetails && ticketDetails.length > 0) {
      const rawStatus = ticketDetails[0].status || ticketDetails[0].ticket_status;
      let mappedStatus = null;
      
      // Mapear estados de Kupos a nuestros estados internos
      if (rawStatus) {
        const lowerStatus = rawStatus.toLowerCase();
        if (lowerStatus === 'canceled' || lowerStatus === 'cancelled') {
          mappedStatus = 'anulado';
        } else if (lowerStatus === 'confirmed') {
          mappedStatus = 'confirmado';
        }
        // Si Kupos devuelve cualquier otra cosa, NO lo mapeamos
        // para evitar sobrescribir nuestros estados locales (expirado, error_confirmacion)
      }
      
      const result = { operator_pnr: ticketDetails[0].operator_pnr };
      if (mappedStatus) {
        result.status = mappedStatus;
      }
      
      return result;
    }
  } catch (err) {
    console.warn(`[KUPOS] No se pudo obtener información para ticket ${numeroTicket}: ${err.message}`);
  }
  return null;
};

exports.fetchTicketInfoFromKupos = fetchTicketInfoFromKupos;


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
    order: [['fecha_evento', 'ASC'], ['id', 'ASC']]
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
    monto_pagado,
    porcentaje_descuento_aplicado,
    codigo_autorizacion,
    token,
    estado,
    tipo_pago,
    confirmed_pnrs,
    respuesta_kupos
  } = data;

  let finalPasajeroId = pasajero_id;
  let pasajero;

  const { formatRut } = require('../utils/rut.utils');
  const { Evento } = require('../models');

  // Idempotencia: Si el frontend reintenta enviar un boleto que ya guardamos con éxito,
  // devolvemos el existente inmediatamente para que el frontend marque la sincronización como exitosa.
  if (pnr) {
    const existe = await Evento.findOne({ where: { pnr } });
    if (existe) {
      console.log(`[EVENTO] El PNR ${pnr} ya existe. Retornando evento existente (Idempotencia).`);
      return existe;
    }
  } else if (numero_ticket) {
    const existe = await Evento.findOne({ where: { numero_ticket } });
    if (existe) {
      console.log(`[EVENTO] El Ticket ${numero_ticket} ya existe. Retornando evento existente (Idempotencia).`);
      return existe;
    }
  }

  // Si el id es un string (posiblemente un RUT enviado por error desde el front)
  if (typeof pasajero_id === 'string') {
    const rutFormateado = formatRut(pasajero_id);
    console.log(`[EVENTO] Recibido pasajero_id como string (RUT): ${pasajero_id}. Normalizado a: ${rutFormateado}`);
    pasajero = await Pasajero.findOne({ where: { rut: rutFormateado } });
    
    if (pasajero) {
      finalPasajeroId = pasajero.id;
      console.log(`[EVENTO] Pasajero resuelto por RUT: ${pasajero.rut} -> ID: ${finalPasajeroId}`);
    }
  } else {
    pasajero = await Pasajero.findByPk(pasajero_id);
  }

  if (!pasajero) throw new NotFoundError('Pasajero no encontrado');

  let finalEmpresaId = empresa_id;

  // Flag para determinar si el pasajero es beneficiario directo o invitado/familiar.
  // Se declara fuera del if para que sea accesible al guardar el evento.
  let esBeneficiarioDirecto = true; // Por defecto true (sin convenio = no es invitado)

  if (convenio_id) {
    const convenio = await Convenio.findByPk(convenio_id);
    if (!convenio) throw new NotFoundError('Convenio no encontrado');
    
    // VALIDACIÓN INFORMATIVA: Verificar si el pasajero es beneficiario directo del convenio.
    // NOTA: Los familiares/amigos de un beneficiario pueden comprar pasajes con el convenio
    // sin estar en ninguna nómina. El convenio se hereda SOLO en el boleto, no en la persona.
    // Por lo tanto, esta validación es INFORMATIVA (log), NO bloqueante.
    console.log(`[EVENTO] Verificando membresía para convenio: ${convenio.nombre} (ID: ${convenio_id})`);

    esBeneficiarioDirecto = false;

    // 1. Verificación en Tablas Corporativas Dinámicas
    const registroCorp = await RegistroTablaClienteCorporativo.findOne({ where: { convenio_id } });
    if (registroCorp) {
      const ModeloNomina = definirModeloDinamico(sequelize, registroCorp.nombre_tabla);
      const cleanRut = pasajero.rut.replace(/[^0-9kK]/g, '');
      
      const estaEnNomina = await ModeloNomina.findOne({ 
        where: { 
          [Op.and]: [
            sequelize.where(
              sequelize.fn('REPLACE', sequelize.fn('REPLACE', sequelize.col('rut'), '.', ''), '-', ''),
              cleanRut
            ),
            { status: 'ACTIVO' }
          ]
        } 
      });

      if (estaEnNomina) {
        esBeneficiarioDirecto = true;
        console.log(`[EVENTO] ✅ Membresía corporativa validada para ${pasajero.rut}`);
      } else {
        console.log(`[EVENTO] ℹ️ Pasajero ${pasajero.rut} no está en nómina corporativa ${registroCorp.nombre_tabla} - se permite como familiar/acompañante`);
      }
    }

    // 2. Verificación en Tablas Estáticas (FACh, Carabineros, etc.) - Solo si aún no fue validado
    if (!esBeneficiarioDirecto) {
      const nombreLower = convenio.nombre.toLowerCase();
      const cleanRut = pasajero.rut.replace(/[^0-9kK]/g, '');
      
      if (nombreLower.includes('fach')) {
        const registroFach = await Fach.findOne({ 
          where: sequelize.where(
            sequelize.fn('REPLACE', sequelize.fn('REPLACE', sequelize.col('rut'), '.', ''), '-', ''),
            cleanRut
          )
        });
        if (registroFach && registroFach.status === 'ACTIVO') {
          esBeneficiarioDirecto = true;
          console.log(`[EVENTO] ✅ Pasajero ${pasajero.rut} validado en tabla FACH`);
        }
      } else if (nombreLower.includes('carabinero')) {
        const rutSinDV = cleanRut.slice(0, -1);
        const registroCarab = await Carabinero.findOne({ 
          where: sequelize.where(
            sequelize.fn('REPLACE', sequelize.fn('REPLACE', sequelize.col('rut'), '.', ''), '-', ''),
            rutSinDV
          )
        });
        if (registroCarab && registroCarab.status === 'ACTIVO') {
          esBeneficiarioDirecto = true;
          console.log(`[EVENTO] ✅ Pasajero ${pasajero.rut} validado en tabla Carabineros`);
        }
      } else if (nombreLower.includes('estudiante') || nombreLower.includes('tne')) {
        const registroEst = await Estudiante.findOne({ 
          where: sequelize.where(
            sequelize.fn('REPLACE', sequelize.fn('REPLACE', sequelize.col('rut'), '.', ''), '-', ''),
            cleanRut
          )
        });
        if (registroEst && registroEst.status === 'ACTIVO') {
          esBeneficiarioDirecto = true;
          console.log(`[EVENTO] ✅ Pasajero ${pasajero.rut} validado en tabla Estudiantes`);
        }
      } else if (nombreLower.includes('adulto mayor')) {
        const registroAM = await AdultoMayor.findOne({ 
          where: sequelize.where(
            sequelize.fn('REPLACE', sequelize.fn('REPLACE', sequelize.col('rut'), '.', ''), '-', ''),
            cleanRut
          )
        });
        if (registroAM && registroAM.status === 'ACTIVO') {
          esBeneficiarioDirecto = true;
          console.log(`[EVENTO] ✅ Pasajero ${pasajero.rut} validado en tabla Adulto Mayor`);
        }
      } else {
        // Si no es un convenio estático conocido, asumimos que se valida por otras vías o es libre
        esBeneficiarioDirecto = true;
      }
    }

    // 3. Respaldo: Verificar en la tabla global de Beneficiarios
    if (!esBeneficiarioDirecto) {
      const { Beneficiario } = require('../models');
      const formattedRUT = formatRut(pasajero.rut);
      const nombreLower = convenio.nombre.toLowerCase();
      const cleanRut = pasajero.rut.replace(/[^0-9kK]/g, '');
      
      const orConditions = [
        { rut: formattedRUT },
        { rut: pasajero.rut }
      ];

      if (convenio_id === 115 || nombreLower.includes('carabinero')) {
        orConditions.push({ rut: cleanRut.slice(0, -1) });
      }

      const beneficiarioGlobal = await Beneficiario.findOne({
        where: {
          [Op.or]: orConditions,
          convenio_id: convenio_id,
          status: 'ACTIVO'
        }
      });

      if (beneficiarioGlobal) {
        esBeneficiarioDirecto = true;
        console.log(`[EVENTO] ✅ Validación exitosa vía tabla Global de Beneficiarios para ${pasajero.rut}`);
      }
    }

    // Log final informativo - NUNCA bloqueamos la creación del evento
    if (!esBeneficiarioDirecto) {
      console.log(`[EVENTO] ℹ️ Pasajero ${pasajero.rut} NO es beneficiario directo del convenio ${convenio.nombre} (ID: ${convenio_id}). Se permite como familiar/acompañante. El convenio se hereda en el boleto.`);
    }

    // Si hay discrepancia entre lo enviado y el convenio, forzamos el id del convenio
    if (convenio.empresa_id !== parseInt(empresa_id)) {
      console.warn(`[EVENTO] Discrepancia de empresa_id detectada: El convenio ${convenio_id} pertenece a la empresa ${convenio.empresa_id}, pero se recibió ${empresa_id}. Corrigiendo automáticamente.`);
      finalEmpresaId = convenio.empresa_id;
    }
  }

  const empresa = await Empresa.findByPk(finalEmpresaId);
  if (!empresa) throw new NotFoundError('Empresa no encontrada');

  // Normalizar estado para evitar que quede en blanco (null, undefined o "")
  let finalEstado = (estado === null || estado === undefined || estado === "") ? "revisar" : estado;

  // Valores por defecto si no vienen del front (aunque deberían venir)
  const finalPorcentaje = porcentaje_descuento_aplicado !== undefined ? porcentaje_descuento_aplicado : 0;
  const finalMontoPagado = monto_pagado !== undefined ? monto_pagado : tarifa_base;

  console.log(`[EVENTO] Iniciando creación de COMPRA - Pasajero: ${finalPasajeroId}, PNR: ${pnr}, Ticket: ${numero_ticket}`);

  let finalPnr = pnr;
  // Siempre consultar Kupos para validar el operator_pnr real y sincronizar el estado
  if (numero_ticket) {
    console.log(`[KUPOS] Consultando Kupos para ticket ${numero_ticket}...`);
    const kuposInfo = await fetchTicketInfoFromKupos(numero_ticket);
    if (kuposInfo) {
      // 1. Sincronizar PNR
      if (kuposInfo.operator_pnr) {
        console.log(`[KUPOS] operator_pnr obtenido: ${kuposInfo.operator_pnr} para ticket ${numero_ticket}`);
        finalPnr = kuposInfo.operator_pnr;
      }
      // 2. Sincronizar Estado
      if (kuposInfo.status && kuposInfo.status !== finalEstado) {
        if (kuposInfo.status === 'anulado') {
          // Si Kupos dice anulado, validamos nuestro estado actual
          if (['expirado', 'error_confirmacion', 'anulado'].includes(finalEstado)) {
            console.log(`[KUPOS] Kupos devolvió 'anulado' pero se respeta el estado local '${finalEstado}'`);
          } else {
            // Si es 'confirmado', 'revisar' u otro, lo pasamos a 'anulado'
            console.log(`[KUPOS] Actualizando estado de '${finalEstado}' a 'anulado' según Kupos`);
            finalEstado = 'anulado';
          }
        } else {
          // Si Kupos dice 'confirmado' (u otro), lo actualizamos normal
          console.log(`[KUPOS] Actualizando estado de '${finalEstado}' a '${kuposInfo.status}' según Kupos`);
          finalEstado = kuposInfo.status;
        }
      }
    } else {
      console.warn(`[KUPOS] No se obtuvo información para ticket ${numero_ticket}, se guardan datos originales.`);
    }
  }

  // ── VALIDACIÓN DE INTEGRIDAD DE MONTOS SEGÚN CONVENIO ────────────────────
  let finalMontoDescuento = 0;
  const base = Number(tarifa_base) || 0;
  const pagado = Number(finalMontoPagado) || 0;

  if (convenio_id) {
    const { Convenio } = require('../models');
    const convenio = await Convenio.findByPk(convenio_id);
    
    if (convenio) {
      const valor = Number(convenio.valor_descuento) || 0;
      let pagadoEsperado = base;

      if (convenio.tipo_descuento === 'Porcentaje') {
        finalMontoDescuento = Math.round(base * (valor / 100));
        pagadoEsperado = base - finalMontoDescuento;
      } else if (convenio.tipo_descuento === 'Monto Fijo') {
        finalMontoDescuento = valor;
        pagadoEsperado = Math.max(0, base - valor);
      } else if (convenio.tipo_descuento === 'Tarifa Plana') {
        pagadoEsperado = valor;
        finalMontoDescuento = Math.max(0, base - valor);
      }

      // Validar que el monto pagado coincida con el esperado (permitimos margen de $5 por redondeos de Kupos)
      if (Math.abs(pagado - pagadoEsperado) > 5) {
        console.error(`[EVENTO] ❌ Rechazado por Discrepancia de Montos:
          Ticket/PNR: ${numero_ticket || pnr}
          Convenio: ${convenio.nombre}
          Pagado en Kupos: $${pagado}
          Esperado en Plataforma: $${pagadoEsperado}
          Diferencia: $${Math.abs(pagado - pagadoEsperado)}
          Regla: ${convenio.tipo_descuento} de $${valor}`);
          
        throw new BusinessError(
          `El monto pagado ($${pagado.toLocaleString('es-CL')}) no coincide con la tarifa esperada del convenio ($${pagadoEsperado.toLocaleString('es-CL')}). ` +
          `Regla: ${convenio.tipo_descuento} de $${valor.toLocaleString('es-CL')}.`
        );
      }
    }
  } else {
    // Si no hay convenio (pago público), el descuento es 0
    finalMontoDescuento = Math.max(0, base - pagado);
  }

  // Guardia final para evitar monto_pagado = 0 en tarifas con costo
  if (pagado === 0 && base > 0) {
    console.error(`[EVENTO] ❌ Rechazado: monto_pagado es $0 para una tarifa base de $${base}. Ticket: ${numero_ticket || pnr}`);
    throw new BusinessError(`monto_pagado no puede ser $0 cuando la tarifa_base es $${base.toLocaleString('es-CL')}.`);
  }
  // ──────────────────────────────────────────────────────────────────────────

  // (REMOVED) Verificar topes de convenio: A petición del negocio ya no se valida stock/monto al comprar,
  // solo se registra el consumo posteriormente.

  const eventoDataToSave = {
    tipo_evento: 'COMPRA',
    tipo_pago,
    pasajero_id: finalPasajeroId,
    empresa_id: finalEmpresaId,
    convenio_id,
    ciudad_origen,
    ciudad_destino,
    fecha_viaje,
    hora_salida,
    terminal_origen,
    terminal_destino,
    numero_asiento,
    numero_ticket,
    pnr: finalPnr,
    tarifa_base,
    porcentaje_descuento_aplicado: finalPorcentaje,
    monto_pagado: finalMontoPagado,
    monto_descuento: finalMontoDescuento,
    codigo_autorizacion,
    token,
    estado: finalEstado,
    respuesta_kupos,
    invitado: !esBeneficiarioDirecto,
    fecha_evento: new Date().toISOString()
  };

  // Solo guardamos el array si tipo_pago es credito y viene el arreglo en la peticion
  if (tipo_pago === 'credito' && Array.isArray(confirmed_pnrs)) {
    eventoDataToSave.confirmed_pnrs = confirmed_pnrs;
  }

  const evento = await Evento.create(eventoDataToSave);
  console.log(`[EVENTO] COMPRA guardada exitosamente - ID: ${evento.id}, PNR final: ${finalPnr}`);

  // Notificación para eventos expirados
  if (evento.estado === 'expirado') {
    emailService.enviarNotificacionEventoExpirado(evento).catch(err => {
      console.error('[EVENTO] Error enviando notificación de evento expirado:', err.message);
    });
  }

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

  let finalEstado = estado || status;
  // Normalizar estado para evitar que quede en blanco (null, undefined o "")
  if (finalEstado === null || finalEstado === undefined || finalEstado === "") {
    finalEstado = "revisar";
  }

  if (!numero_ticket && !pnr) {
    throw new BusinessError('Debe proporcionar numero_ticket o pnr para realizar una devolución');
  }

  // 1. Obtener el evento actual (debe ser COMPRA)
  // We pass the criteria object directly
  const criteria = {};
  if (numero_ticket) criteria.numero_ticket = numero_ticket;
  if (pnr) criteria.pnr = pnr;

  console.log(`[EVENTO] Iniciando DEVOLUCION - Criterio: ${JSON.stringify(criteria)}`);

  const eventoActual = await this.obtenerEventoActual(criteria);

  // En lugar de crear un nuevo evento, actualizamos el evento original encontrado
  const eventoGuardado = await Evento.findByPk(eventoActual.id);

  if (monto_devolucion !== undefined) eventoGuardado.monto_devolucion = monto_devolucion;
  if (codigo_autorizacion !== undefined) eventoGuardado.codigo_autorizacion = codigo_autorizacion;
  if (token !== undefined) eventoGuardado.token = token;
  if (finalEstado !== undefined) eventoGuardado.estado = finalEstado;
  if (tipo_pago !== undefined) eventoGuardado.tipo_pago = tipo_pago;

  await eventoGuardado.save();
  console.log(`[EVENTO] DEVOLUCION aplicada exitosamente - Registro actualizado ID: ${eventoGuardado.id}`);
  return await this.obtenerEvento(eventoGuardado.id);

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

  // Filtrado por fecha (Rango)
  if (otherFilters.startDate || otherFilters.endDate) {
    where.fecha_evento = {};
    if (otherFilters.startDate) where.fecha_evento[Op.gte] = otherFilters.startDate;
    if (otherFilters.endDate) where.fecha_evento[Op.lte] = otherFilters.endDate;
  }

  // Filtros directos en el modelo Evento
  if (otherFilters.id) where.id = otherFilters.id;
  if (otherFilters.tipo_evento) where.tipo_evento = otherFilters.tipo_evento;
  if (otherFilters.empresa_id) where.empresa_id = otherFilters.empresa_id;
  if (otherFilters.pasajero_id) where.pasajero_id = otherFilters.pasajero_id;
  if (otherFilters.convenio_id) where.convenio_id = otherFilters.convenio_id;
  if (otherFilters.pnr) where.pnr = otherFilters.pnr;
  if (otherFilters.numero_ticket) where.numero_ticket = otherFilters.numero_ticket;
  if (otherFilters.estado) where.estado = otherFilters.estado;

  // Filtros en el modelo Pasajero (Include)
  const passengerWhere = {};
  if (otherFilters.rut) {
    passengerWhere.rut = { [Op.like]: `%${otherFilters.rut}%` };
  }
  if (otherFilters.search) {
    passengerWhere[Op.or] = [
      { nombres: { [Op.like]: `%${otherFilters.search}%` } },
      { apellidos: { [Op.like]: `%${otherFilters.search}%` } }
    ];
  }

  const sortField = sortBy || 'fecha_evento';
  const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

  const data = await Evento.findAndCountAll({
    where,
    include: [
      { 
        model: Pasajero, 
        where: Object.keys(passengerWhere).length > 0 ? passengerWhere : null,
        required: Object.keys(passengerWhere).length > 0, // Filtro estricto si hay búsqueda por pasajero
        attributes: ['id', 'rut', 'nombres', 'apellidos'] 
      },
      { model: Empresa, attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, attributes: ['id', 'nombre'] }
    ],
    order: [[sortField, sortOrder]],
    limit: limitVal,
    offset
  });

  // Enriquecer los arreglos confirmed_pnrs con numero_asiento y monto_pagado
  const enrichedRows = await Promise.all(data.rows.map(async (row) => {
    // Si tiene arreglos PNRs validos, los interamos y consultamos la db para obtener los detalles extras
    if (row.confirmed_pnrs && Array.isArray(row.confirmed_pnrs) && row.confirmed_pnrs.length > 0) {
      const pnrsDetalles = await Promise.all(row.confirmed_pnrs.map(async (pnrString) => {
        const eventoPnr = await Evento.findOne({
          where: { pnr: pnrString, tipo_evento: 'COMPRA' },
          attributes: ['numero_asiento', 'monto_pagado', 'tarifa_base']
        });

        return {
          pnr: pnrString,
          numero_asiento: eventoPnr ? eventoPnr.numero_asiento : null,
          monto_pagado: eventoPnr ? eventoPnr.monto_pagado : null,
          tarifa_base: eventoPnr ? eventoPnr.tarifa_base : null
        };
      }));
      // Evitamos mutar directamente el model the Sequelize, extraemos los datos al objecto simple
      const rawEvento = row.toJSON();
      rawEvento.confirmed_pnrs = pnrsDetalles;
      return rawEvento;
    }
    return row.toJSON();
  }));

  // Sobrescribir rows con la data enriquecida y en crudo
  data.rows = enrichedRows;

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

  // Enriquecer arreglo confirmed_pnrs si existe
  if (evento.confirmed_pnrs && Array.isArray(evento.confirmed_pnrs) && evento.confirmed_pnrs.length > 0) {
    const pnrsDetalles = await Promise.all(evento.confirmed_pnrs.map(async (pnrString) => {
      const eventoPnr = await Evento.findOne({
        where: { pnr: pnrString, tipo_evento: 'COMPRA' },
        attributes: ['numero_asiento', 'monto_pagado', 'tarifa_base']
      });

      return {
        pnr: pnrString,
        numero_asiento: eventoPnr ? eventoPnr.numero_asiento : null,
        monto_pagado: eventoPnr ? eventoPnr.monto_pagado : null,
        tarifa_base: eventoPnr ? eventoPnr.tarifa_base : null
      };
    }));

    const rawEvento = evento.toJSON();
    rawEvento.confirmed_pnrs = pnrsDetalles;
    return rawEvento;
  }

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

/**
 * Actualizar estado y PNR de un evento desde Kupos
 */
exports.actualizarEstadoEvento = async (id, nuevoEstado, nuevoPnr) => {
  const evento = await Evento.findByPk(id);
  if (evento) {
    let modified = false;
    if (nuevoEstado && evento.estado !== nuevoEstado) {
      evento.estado = nuevoEstado;
      modified = true;
    }
    if (nuevoPnr && evento.pnr !== nuevoPnr) {
      evento.pnr = nuevoPnr;
      modified = true;
    }
    if (modified) await evento.save();
  }
};
