const { Reembolso } = require('../models');
const { Op } = require('sequelize');

/**
 * Crear una nueva solicitud de reembolso
 */
exports.crearReembolso = async (data) => {
    return await Reembolso.create(data);
};

/**
 * Listar reembolsos con filtros y paginación
 */
exports.listarReembolsos = async (filters) => {
    const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        order = 'DESC',
        search,
        estado,
        pnr,
        rut
    } = filters;

    const offset = (page - 1) * limit;
    const where = {};

    if (estado) where.estado = estado;
    if (pnr) where.pnr = { [Op.like]: `%${pnr}%` };
    if (rut) where.rut = { [Op.like]: `%${rut}%` };
    
    if (search) {
        where[Op.or] = [
            { pnr: { [Op.like]: `%${search}%` } },
            { rut: { [Op.like]: `%${search}%` } },
            { correo: { [Op.like]: `%${search}%` } },
            { operador: { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Reembolso.findAndCountAll({
        where,
        order: [[sortBy, order]],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        rows
    };
};

/**
 * Obtener un reembolso por ID
 */
exports.obtenerReembolso = async (id) => {
    const reembolso = await Reembolso.findByPk(id);
    if (!reembolso) throw new Error('Reembolso no encontrado');
    return reembolso;
};

/**
 * Actualizar un reembolso
 */
exports.actualizarReembolso = async (id, data) => {
    const reembolso = await this.obtenerReembolso(id);
    return await reembolso.update(data);
};

/**
 * Eliminar un reembolso (soft delete)
 */
exports.eliminarReembolso = async (id) => {
    const reembolso = await this.obtenerReembolso(id);
    return await reembolso.destroy();
};

/**
 * Obtener por token
 */
exports.obtenerPorToken = async (token) => {
    return await Reembolso.findOne({ where: { token } });
};

/**
 * Actualizar por token
 */
exports.actualizarPorToken = async (token, data) => {
    const reembolso = await this.obtenerPorToken(token);
    if (!reembolso) throw new Error('Solicitud no encontrada');
    return await reembolso.update(data);
};
