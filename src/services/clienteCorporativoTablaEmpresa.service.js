const { RegistroTablaClienteCorporativo, sequelize } = require('../models');
const NotFoundError = require('../exceptions/NotFoundError');
const BusinessError = require('../exceptions/BusinessError');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const definirModeloDinamico = require('../utils/definirModeloDinamico');
const pasajerosService = require('./pasajeros.service');
const { formatRut, validateRut } = require('../utils/rut.utils');
const { Op } = require('sequelize');

const getModelo = (nombreTabla) => {
  const M = definirModeloDinamico(sequelize, nombreTabla);
  if (!M) throw new NotFoundError('Tabla');
  return M;
};

const resolveRegistro = async (nombreTabla, status = null) => {
  const where = {
    [Op.or]: [
      { nombre_tabla: nombreTabla },
      { nombre_tabla: `clientes_corporativos_${nombreTabla}` }
    ]
  };
  if (status) where.status = status;

  const reg = await RegistroTablaClienteCorporativo.findOne({ where });
  if (!reg) throw new NotFoundError('Convenio corporativo');
  return reg;
};

exports.validarRut = async (nombreTabla, rut) => {
  const reg = await resolveRegistro(nombreTabla, 'ACTIVO');
  const physicalName = reg.nombre_tabla;

  const Modelo = getModelo(physicalName);
  const rutLimpio = formatRut(rut);
  const cliente = await Modelo.findOne({ where: { rut: rutLimpio } });

  if (!cliente) throw new NotFoundError('RUT no encontrado en la nómina corporativa.');
  if (cliente.status !== 'ACTIVO') throw new BusinessError('El cliente corporativo se encuentra INACTIVO.');

  return await pasajerosService.validarYRegistrarPasajero({
    rut: cliente.rut,
    nombres: cliente.nombre_completo.split(' ')[0] || 'Cliente',
    apellidos: cliente.nombre_completo.split(' ').slice(1).join(' ') || 'Corporativo',
    empresa_id: reg.empresa_id,
    convenio_id: reg.convenio_id
  });
};

exports.listar = async (nombreTabla, params) => {
  const reg = await resolveRegistro(nombreTabla);
  const physicalName = reg.nombre_tabla;

  const { page, limit, search, status, sortBy = 'id', order = 'DESC' } = params;
  const { limit: l, offset } = getPagination(page, limit);
  const Modelo = getModelo(physicalName);
  const where = {};
  if (status) where.status = status;
  if (search) where[Op.or] = [{ rut: { [Op.like]: `%${search}%` } }, { nombre_completo: { [Op.like]: `%${search}%` } }];

  const data = await Modelo.findAndCountAll({ where, limit: l, offset, order: [[sortBy, order.toUpperCase()]] });
  return getPagingData(data, page, l);
};

exports.crear = async (nombreTabla, data) => {
  const reg = await resolveRegistro(nombreTabla);
  const physicalName = reg.nombre_tabla;
  
  const M = getModelo(physicalName);

  // Validar y formatear RUT
  const rutFormateado = formatRut(data.rut);
  if (!validateRut(rutFormateado)) throw new BusinessError('El formato del RUT es inválido.');

  const ex = await M.findOne({ where: { rut: rutFormateado } });
  if (ex) throw new BusinessError('El RUT ya está registrado.');
  
  return await M.create({
    ...data,
    rut: rutFormateado,
    empresa_id: reg.empresa_id,
    convenio_id: reg.convenio_id
  });
};

exports.obtenerPorRut = async (nombreTabla, rut) => {
  const reg = await resolveRegistro(nombreTabla);
  const physicalName = reg.nombre_tabla;

  const M = getModelo(physicalName);
  const rutLimpio = formatRut(rut);
  const a = await M.findOne({ where: { rut: rutLimpio } });
  if (!a) throw new NotFoundError('Cliente corporativo');
  return a;
};

exports.actualizar = async (nombreTabla, rut, data) => {
  const a = await this.obtenerPorRut(nombreTabla, rut);
  if (data.rut) data.rut = formatRut(data.rut);
  return await a.update(data);
};

exports.cambiarEstado = async (nombreTabla, rut) => {
  const a = await this.obtenerPorRut(nombreTabla, rut);
  return await a.update({ status: a.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' });
};

exports.eliminar = async (nombreTabla, rut) => {
  const a = await this.obtenerPorRut(nombreTabla, rut);
  await a.destroy();
  return true;
};

exports.cargarCsv = async (nombreTabla, filas) => {
  const reg = await resolveRegistro(nombreTabla);
  const physicalName = reg.nombre_tabla;
  const M = getModelo(physicalName);

  let ok = 0; 
  let formattedCount = 0;
  let errs = [];
  const rutsProcesados = new Set();
  const detalleFormateados = [];

  for (const [i, f] of filas.entries()) {
    try {
      const originalRut = String(f.rut || '').trim();
      if (!originalRut) {
        errs.push({ fila: i + 1, motivo: 'RUT vacío' });
        continue;
      }

      // 1. Limpieza y Formateo (XXXXXXXX-X)
      const rutFormateado = formatRut(originalRut);
      
      // 2. Validar formato real
      if (!validateRut(rutFormateado)) {
        errs.push({ fila: i + 1, rut: originalRut, motivo: 'Formato de RUT inválido' });
        continue;
      }

      // Registrar si fue formateado (original era distinto al limpio final)
      if (originalRut !== rutFormateado) {
        formattedCount++;
        detalleFormateados.push({ fila: i + 1, original: originalRut, final: rutFormateado });
      }

      // 3. Validar duplicados en el mismo lote
      if (rutsProcesados.has(rutFormateado)) {
        errs.push({ fila: i + 1, rut: rutFormateado, motivo: 'RUT repetido en el archivo' });
        continue;
      }
      rutsProcesados.add(rutFormateado);

      // 4. Validar contra la base de datos
      const existe = await M.findOne({ where: { rut: rutFormateado } });
      if (existe) {
        errs.push({ fila: i + 1, rut: rutFormateado, motivo: 'El RUT ya se encuentra registrado' });
        continue;
      }

      // 5. Creación con IDs heredados
      await M.create({ 
        rut: rutFormateado, 
        nombre_completo: f.nombre_completo || 'Sin Nombre', 
        status: 'ACTIVO',
        empresa_id: reg.empresa_id,
        convenio_id: reg.convenio_id
      });
      ok++;
    } catch (e) { 
      errs.push({ fila: i + 1, rut: f.rut || 'N/A', motivo: e.message }); 
    }
  }
  
  return { 
    total: filas.length, 
    exitosos: ok, 
    formateados: formattedCount,
    detalleFormateados,
    errores: errs 
  };
};
