const { Pasajero, TipoPasajero, Empresa, Convenio } = require('../models');
const { Op } = require('sequelize');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

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

  if (!rut || !nombres || !apellidos || !fecha_nacimiento) {
    throw new BusinessError('RUT, nombres, apellidos y fecha de nacimiento son obligatorios');
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

  const sortField = sortBy || 'createdAt';
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
