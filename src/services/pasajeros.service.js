const { Pasajero, TipoPasajero, Empresa, Convenio, Evento } = require('../models');
const { Op } = require('sequelize');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const convenioService = require('./convenio.service');

/**
 * Calcular edad desde fecha de nacimiento
 */
const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return edad;
};

/**
 * Determinar tipo de pasajero por edad
 */
const determinarTipoPasajero = async (fechaNacimiento) => {
  if (!fechaNacimiento) {
    const defaultTipo = await TipoPasajero.findOne({ where: { nombre: 'GENERAL' } });
    return defaultTipo ? defaultTipo.id : null;
  }
  const edad = calcularEdad(fechaNacimiento);

  const tipoPorEdad = await TipoPasajero.findOne({
    where: {
      edad_min: { [Op.lte]: edad },
      edad_max: { [Op.gte]: edad },
      status: 'ACTIVO'
    }
  });

  if (tipoPorEdad) return tipoPorEdad.id;

  // Default: GENERAL
  const defaultTipo = await TipoPasajero.findOne({ where: { nombre: 'GENERAL' } });
  return defaultTipo ? defaultTipo.id : null;
};

/**
 * Crear pasajero
 */
exports.crearPasajero = async (data) => {
  const { rut, nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero_id, empresa_id, convenio_id } = data;

  if (!rut || !nombres || !apellidos) {
    throw new BusinessError('RUT, nombres y apellidos son obligatorios');
  }

  // Verificar si ya existe
  const existe = await Pasajero.findOne({ where: { rut } });
  if (existe) {
    throw new BusinessError('Ya existe un pasajero con ese RUT');
  }

  // Determinar tipo de pasajero si no se proporciona
  let tipoId = tipo_pasajero_id;
  if (!tipoId) {
    tipoId = await determinarTipoPasajero(fecha_nacimiento);
  } else {
    // Validar que el tipo existe
    const tipo = await TipoPasajero.findByPk(tipoId);
    if (!tipo) {
      throw new NotFoundError('Tipo de pasajero no encontrado');
    }
  }

  // Validar empresa si se proporciona
  if (empresa_id) {
    const empresa = await Empresa.findByPk(empresa_id);
    if (!empresa) {
      throw new NotFoundError('Empresa no encontrada');
    }
  }

  // Validar convenio si se proporciona
  if (convenio_id) {
    const convenio = await Convenio.findByPk(convenio_id);
    if (!convenio) {
      throw new NotFoundError('Convenio no encontrado');
    }
  }

  const pasajero = await Pasajero.create({
    rut,
    nombres,
    apellidos,
    fecha_nacimiento,
    correo,
    telefono,
    tipo_pasajero_id: tipoId,
    empresa_id,
    convenio_id,
    status: 'ACTIVO'
  });

  return await Pasajero.findByPk(pasajero.id, {
    include: [
      { model: TipoPasajero, as: 'tipoPasajero', attributes: ['id', 'nombre'] },
      { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] }
    ]
  });
};

/**
 * Listar pasajeros
 */
exports.listarPasajeros = async (filters = {}) => {
  const { page, limit, sortBy, order, status, ...otherFilters } = filters;
  const { offset, limit: limitVal } = getPagination(page, limit);
  const where = {};

  if (status || otherFilters.status) {
    where.status = status || otherFilters.status;
  }

  if (otherFilters.empresa_id) {
    where.empresa_id = otherFilters.empresa_id;
  }

  if (otherFilters.convenio_id) {
    where.convenio_id = otherFilters.convenio_id;
  }

  if (otherFilters.tipo_pasajero_id) {
    where.tipo_pasajero_id = otherFilters.tipo_pasajero_id;
  }

  const sortField = sortBy || 'id';
  const sortOrder = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

  const data = await Pasajero.findAndCountAll({
    where,
    include: [
      { model: TipoPasajero, as: 'tipoPasajero', attributes: ['id', 'nombre'] },
      { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] }
    ],
    order: [[sortField, sortOrder]],
    limit: limitVal,
    offset
  });

  return getPagingData(data, page, limitVal);
};

/**
 * Obtener pasajero por ID
 */
exports.obtenerPasajero = async (id) => {
  const pasajero = await Pasajero.findByPk(id, {
    include: [
      { model: TipoPasajero, as: 'tipoPasajero', attributes: ['id', 'nombre'] },
      { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] }
    ]
  });

  if (!pasajero) {
    throw new NotFoundError('Pasajero no encontrado');
  }

  return pasajero;
};

/**
 * Buscar pasajero por RUT
 */
exports.buscarPorRut = async (rut) => {
  const pasajero = await Pasajero.findOne({
    where: { rut },
    include: [
      { model: TipoPasajero, as: 'tipoPasajero', attributes: ['id', 'nombre'] },
      { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] }
    ]
  });

  if (!pasajero) {
    throw new NotFoundError('Pasajero no encontrado');
  }

  return pasajero;
};

/**
 * Actualizar pasajero
 */
exports.actualizarPasajero = async (id, datos) => {
  const pasajero = await Pasajero.findByPk(id);

  if (!pasajero) {
    throw new NotFoundError('Pasajero no encontrado');
  }

  const { nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero_id, empresa_id, convenio_id, status } = datos;

  if (nombres) pasajero.nombres = nombres;
  if (apellidos) pasajero.apellidos = apellidos;
  if (fecha_nacimiento) pasajero.fecha_nacimiento = fecha_nacimiento;
  if (correo) pasajero.correo = correo;
  if (telefono) pasajero.telefono = telefono;
  if (status) pasajero.status = status;

  if (tipo_pasajero_id) {
    const tipo = await TipoPasajero.findByPk(tipo_pasajero_id);
    if (!tipo) {
      throw new NotFoundError('Tipo de pasajero no encontrado');
    }
    pasajero.tipo_pasajero_id = tipo_pasajero_id;
  }

  if (empresa_id) {
    const empresa = await Empresa.findByPk(empresa_id);
    if (!empresa) {
      throw new NotFoundError('Empresa no encontrada');
    }
    pasajero.empresa_id = empresa_id;
  }

  if (convenio_id) {
    const convenio = await Convenio.findByPk(convenio_id);
    if (!convenio) {
      throw new NotFoundError('Convenio no encontrado');
    }
    pasajero.convenio_id = convenio_id;
  }

  await pasajero.save();

  return await Pasajero.findByPk(id, {
    include: [
      { model: TipoPasajero, as: 'tipoPasajero', attributes: ['id', 'nombre'] },
      { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'rut_empresa'] },
      { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] }
    ]
  });
};

/**
 * Eliminar pasajero (soft delete)
 */
exports.eliminarPasajero = async (id) => {
  const pasajero = await Pasajero.findByPk(id);

  if (!pasajero) {
    throw new NotFoundError('Pasajero no encontrado');
  }

  pasajero.status = 'INACTIVO';
  await pasajero.save();

  return pasajero;
};

/**
 * Obtener o crear pasajero (para eventos)
 */
exports.obtenerOCrearPasajero = async (data, transaction) => {
  let pasajero = null;

  if (data.rut) {
    pasajero = await Pasajero.findOne({
      where: { rut: data.rut },
      transaction
    });
  }

  if (!pasajero) {
    const tipoPasajeroId = data.tipo_pasajero_id || await determinarTipoPasajero(data.fecha_nacimiento);

    pasajero = await Pasajero.create(
      {
        rut: data.rut,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        telefono: data.telefono,
        fecha_nacimiento: data.fecha_nacimiento,
        tipo_pasajero_id: tipoPasajeroId,
        empresa_id: data.empresa_id,
        convenio_id: data.convenio_id,
        status: 'ACTIVO'
      },
      { transaction }
    );
  }

  return pasajero;
};
/**
 * Asociar pasajero a eventos (crear si no existe)
 */
exports.asociarPasajeroAEventos = async (data) => {
  const { rut, nombres, apellidos, correo, telefono, fecha_nacimiento, empresa_id, convenio_id, eventos_ids } = data;

  if (!rut) {
    throw new BusinessError('El RUT es obligatorio');
  }

  // 1. Buscar o Crear Pasajero
  let pasajero = await Pasajero.findOne({ where: { rut } });

  if (!pasajero) {
    // Validaciones mínimas para crear
    if (!nombres || !apellidos) {
      throw new BusinessError('Para crear un nuevo pasajero se requieren nombres y apellidos');
    }

    const tipoPasajeroId = await determinarTipoPasajero(fecha_nacimiento);

    pasajero = await Pasajero.create({
      rut,
      nombres,
      apellidos,
      fecha_nacimiento,
      correo,
      telefono,
      tipo_pasajero_id: tipoPasajeroId,
      empresa_id: empresa_id || null,
      convenio_id: convenio_id || null,
      status: 'ACTIVO'
    });
  }

  // 2. Asociar Eventos
  if (eventos_ids && eventos_ids.length > 0) {
    // Verificar que los eventos existan (opcional, pero buena práctica)
    // Actualizar masivamente
    await Evento.update(
      { pasajero_id: pasajero.id },
      {
        where: {
          id: { [Op.in]: eventos_ids }
        }
      }
    );
  }

  // 3. Retornar pasajero con los eventos actualizados (o solo el pasajero)
  // El usuario pidió "asociandole el eventos o eventos", retorno el pasajero y tal vez los eventos asociados.
  return await Pasajero.findByPk(pasajero.id, {
    include: [
      { model: TipoPasajero, as: 'tipoPasajero', attributes: ['id', 'nombre'] },
      { model: Empresa, as: 'empresa', attributes: ['id', 'nombre'] },
      { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] },
      { model: Evento, attributes: ['id', 'tipo_evento', 'fecha_viaje', 'ciudad_origen', 'ciudad_destino'] } // Incluir eventos asociados
    ]
  });
};

/**
 * Validar y Registrar Pasajero (Lógica Unificada para validaciones de RUT)
 * Busca/Crea pasajero, asigna empresa/convenio y verifica topes.
 */
exports.validarYRegistrarPasajero = async ({ rut, nombres, apellidos, correo, telefono, fecha_nacimiento, tipo_pasajero_id, empresa_nombre_defecto, convenio_nombre_defecto }) => {
  if (!rut) {
    throw new BusinessError('El RUT es obligatorio');
  }

  // 1. Buscar o Identificar Empresa y Convenio
  let empresa = null;
  let convenio = null;

  if (empresa_nombre_defecto) {
    empresa = await Empresa.findOne({ where: { nombre: empresa_nombre_defecto } });
  }

  if (convenio_nombre_defecto) {
    convenio = await Convenio.findOne({ where: { nombre: convenio_nombre_defecto } });
  }

  // 2. Verificar Límites del Convenio (si existe)
  if (convenio) {
    // Verificar si ya excedió límites (monto 0 para verificar estado actual)
    await convenioService.verificarLimites(convenio.id, 0);
  }

  // 3. Buscar Pasajero Existente
  let pasajero = await Pasajero.findOne({ where: { rut } });

  // Datos para creación/actualización
  const defaultNombres = nombres || 'Sin Nombre';
  const defaultApellidos = apellidos || 'Sin Apellido';
  let defaultTipo = tipo_pasajero_id;

  if (!defaultTipo && fecha_nacimiento) {
    // Si no viene tipo, intentamos deducirlo por edad
    defaultTipo = await determinarTipoPasajero(fecha_nacimiento);
  }

  if (!pasajero) {
    // CREAR
    pasajero = await Pasajero.create({
      rut,
      nombres: defaultNombres,
      apellidos: defaultApellidos,
      correo: correo || null,
      telefono: telefono || null,
      fecha_nacimiento: fecha_nacimiento || null,
      tipo_pasajero_id: defaultTipo || 1, // Default a GENERAL (1) si falla todo
      empresa_id: empresa ? empresa.id : null,
      convenio_id: convenio ? convenio.id : null,
      status: 'ACTIVO'
    });
  } else {
    // ACTUALIZAR (Solo si es necesario para reactivar o asignar convenio)
    const updateData = {};
    if (convenio) updateData.convenio_id = convenio.id;
    if (empresa) updateData.empresa_id = empresa.id;
    if (nombres && nombres !== 'Sin Nombre') updateData.nombres = nombres;
    if (apellidos && apellidos !== 'Sin Apellido') updateData.apellidos = apellidos;

    // Reactivar si estaba inactivo
    if (pasajero.status !== 'ACTIVO') updateData.status = 'ACTIVO';

    if (Object.keys(updateData).length > 0) {
      await pasajero.update(updateData);
    }
  }

  // 4. Construir Respuesta
  let pasajeroResponse = pasajero.toJSON ? pasajero.toJSON() : pasajero;
  if (pasajeroResponse.imagen_base64) delete pasajeroResponse.imagen_base64;

  return {
    afiliado: true,
    mensaje: 'Validación exitosa',
    pasajero: pasajeroResponse,
    empresa: empresa ? empresa.nombre : (pasajero.empresa ? pasajero.empresa.nombre : 'SIN EMPRESA'),
    descuentos: convenio ? [
      {
        convenio: convenio.nombre,
        porcentaje: convenio.porcentaje_descuento || 0
      }
    ] : []
  };
};
