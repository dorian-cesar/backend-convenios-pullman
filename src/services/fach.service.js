const { Fach, Empresa, Convenio } = require('../models');
const { formatRut } = require('../utils/rut.utils');
const { Op } = require('sequelize');

/**
 * Obtener opciones de paginación y búsqueda
 */
const getPaginationOptions = (page, limit) => {
    const pageVal = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const limitVal = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageVal - 1) * limitVal;
    return { page: pageVal, limit: limitVal, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: dataRows } = data;
    const currentPage = page;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, data: dataRows, totalPages, currentPage };
};

/**
 * Normalizar opciones include para Fach
 */
const getIncludeOptions = () => [
    { model: Empresa, as: 'empresa', attributes: ['id', 'nombre', 'rut_empresa'] },
    { model: Convenio, as: 'convenio', attributes: ['id', 'nombre'] }
];

/**
 * Crear registro FACH
 */
exports.crear = async (data) => {
    const rutFormateado = formatRut(data.rut);

    const existe = await Fach.findByPk(rutFormateado, { paranoid: false });
    if (existe) {
        if (existe.deletedAt) {
            throw new Error('El RUT ya existe pero está inactivo (eliminado lógicamente). Restáurelo o cambie su estado en lugar de crearlo de nuevo.');
        }
        throw new Error('El RUT ingresado ya está registrado en FACH.');
    }

    const fachReg = await Fach.create({ ...data, rut: rutFormateado });
    return this.obtenerPorRut(fachReg.rut);
};

/**
 * Listar registros (Paginado)
 */
exports.obtenerTodos = async (filters = {}) => {
    const { page, limit, rut, search, status } = filters;
    const { page: pageVal, limit: limitVal, offset } = getPaginationOptions(page, limit);

    const where = {};

    if (rut) {
        where.rut = { [Op.like]: `%${rut}%` };
    }

    if (search) {
        where.nombre_completo = { [Op.like]: `%${search}%` };
    }

    if (status) {
        where.status = status;
    }

    const data = await Fach.findAndCountAll({
        where,
        limit: limitVal,
        offset,
        include: getIncludeOptions(),
        order: [['rut', 'ASC']]
    });

    return getPagingData(data, pageVal, limitVal);
};

/**
 * Obtener por RUT
 */
exports.obtenerPorRut = async (rutOriginal) => {
    const rut = formatRut(rutOriginal);
    const fachReg = await Fach.findByPk(rut, {
        include: getIncludeOptions()
    });

    if (!fachReg) throw new Error('Registro FACH no encontrado');
    return fachReg;
};

/**
 * Actualizar
 */
exports.actualizar = async (rutOriginal, data) => {
    const fachReg = await this.obtenerPorRut(rutOriginal);

    // Evitamos que modifiquen el RUT u otros campos no permitidos
    const updatableData = { ...data };
    delete updatableData.rut;
    delete updatableData.id;

    await fachReg.update(updatableData);
    return this.obtenerPorRut(fachReg.rut);
};

/**
 * Eliminar (Soft delete)
 */
exports.eliminar = async (rutOriginal) => {
    const fachReg = await this.obtenerPorRut(rutOriginal);
    await fachReg.destroy();
    return { message: 'Registro FACH eliminado correctamente' };
};

/**
 * Cambiar Estado ACTIVO/INACTIVO
 */
exports.cambiarEstado = async (rutOriginal) => {
    const fachReg = await this.obtenerPorRut(rutOriginal);

    const nuevoEstado = fachReg.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    await fachReg.update({ status: nuevoEstado });

    return this.obtenerPorRut(fachReg.rut);
};
