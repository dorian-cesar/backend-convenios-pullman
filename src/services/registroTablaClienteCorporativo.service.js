const { RegistroTablaClienteCorporativo, ApiConsulta, Empresa, Convenio, sequelize } = require('../models');
const NotFoundError = require('../exceptions/NotFoundError');
const BusinessError = require('../exceptions/BusinessError');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const definirModeloDinamico = require('../utils/definirModeloDinamico');
const { DataTypes } = require('sequelize');

/**
 * Genera un slug seguro para nombres de tabla
 */
const slugify = (text) => {
  return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '_').replace(/[^\w-]+/g, '').replace(/--+/g, '_');
};

/**
 * Crea la tabla física y registra los metadatos.
 * @param {Object} data - { empresa_id, convenio_id, nombre_display, nombre_tabla_personalizado }
 */
exports.crearTablaClienteCorporativo = async (data) => {
  const { empresa_id, convenio_id, nombre_display, nombre_tabla_personalizado } = data;

  if (!nombre_display) throw new BusinessError('El nombre legible es obligatorio');
  if (!empresa_id) throw new BusinessError('La empresa es obligatoria');

  // Si viene un nombre personalizado, lo usamos sanitzado, si no, slugify del display
  const baseName = nombre_tabla_personalizado ? slugify(nombre_tabla_personalizado) : slugify(nombre_display);
  const nombre_tabla = `clientes_corporativos_${baseName}`;

  // Verificar duplicados
  const existente = await RegistroTablaClienteCorporativo.findOne({ where: { nombre_tabla } });
  if (existente) throw new BusinessError(`Ya existe una tabla registrada con este nombre físico: ${nombre_tabla}`);

  const t = await sequelize.transaction();

  try {
    // 1. Crear tabla física
    await sequelize.getQueryInterface().createTable(nombre_tabla, {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      rut: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      nombre_completo: { type: DataTypes.STRING(255), allowNull: true },
      status: { type: DataTypes.STRING(20), defaultValue: 'ACTIVO' },
      empresa_id: { 
        type: DataTypes.INTEGER, 
        allowNull: true,
        references: { model: 'empresas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      convenio_id: { 
        type: DataTypes.INTEGER, 
        allowNull: true,
        references: { model: 'convenios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
      deletedAt: { type: DataTypes.DATE }
    }, { transaction: t });

    // 2. Auto-registrar, actualizar o reutilizar endpoint en api_consulta
    let apiConsulta = null;
    let convenio = null;

    if (convenio_id) {
      convenio = await Convenio.findByPk(convenio_id, { transaction: t });
      if (convenio && convenio.api_consulta_id) {
        // Prioridad 1: Usar la API que el convenio ya tiene asignada
        apiConsulta = await ApiConsulta.findByPk(convenio.api_consulta_id, { transaction: t });
      }
    }

    if (!apiConsulta) {
      // Prioridad 2: Buscar si la empresa ya tiene alguna API configurada
      apiConsulta = await ApiConsulta.findOne({ where: { empresa_id } }, { transaction: t });
    }

    const apiPayload = {
      nombre: `Validación ${nombre_display}`,
      endpoint: `/api/tablas-clientes-corporativos/validar/${baseName}`,
      status: 'ACTIVO',
      empresa_id
    };

    if (apiConsulta) {
      // Actualizar la existente (ej: ID 15 o la de la empresa)
      await apiConsulta.update(apiPayload, { transaction: t });
    } else {
      // Crear una nueva si no existía ninguna
      apiConsulta = await ApiConsulta.create(apiPayload, { transaction: t });
    }

    // Asegurar que el convenio apunte a esta API y sea de tipo API_EXTERNA
    if (convenio) {
      await convenio.update({
        api_consulta_id: apiConsulta.id,
        tipo: 'API_EXTERNA'
      }, { transaction: t });
    }

    // 3. Guardar registro de metadatos
    const registro = await RegistroTablaClienteCorporativo.create({
      nombre_tabla,
      nombre_display,
      empresa_id,
      convenio_id,
      api_consulta_id: apiConsulta.id,
      status: 'ACTIVO'
    }, { transaction: t });

    await t.commit();
    definirModeloDinamico(sequelize, nombre_tabla);
    return registro;

  } catch (error) {
    if (t) await t.rollback();
    throw error;
  }
};

exports.listar = async (params) => {
  const { page, limit, empresa_id, sortBy = 'id', order = 'DESC' } = params;
  const { limit: l, offset } = getPagination(page, limit);

  const where = empresa_id ? { empresa_id } : {};

  const data = await RegistroTablaClienteCorporativo.findAndCountAll({
    where,
    include: [
      { model: Empresa, as: 'empresa', attributes: ['id', 'nombre'] },
      { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] },
      { model: ApiConsulta, as: 'apiConsulta', attributes: ['id', 'endpoint'] }
    ],
    limit: l,
    offset,
    order: [[sortBy, order.toUpperCase()]]
  });

  return getPagingData(data, page, l);
};

exports.obtenerPorId = async (id) => {
  const r = await RegistroTablaClienteCorporativo.findByPk(id, {
    include: [
      { model: Empresa, as: 'empresa' },
      { model: Convenio, as: 'convenio' }
    ]
  });
  if (!r) throw new NotFoundError('Registro de tabla no encontrado');
  return r;
};

exports.actualizar = async (id, data) => {
  const r = await this.obtenerPorId(id);
  return await r.update(data);
};

exports.eliminar = async (id) => {
  const r = await this.obtenerPorId(id);
  await r.destroy();
  return true;
};
