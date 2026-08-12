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
        rut,
        categoria,
        gestor
    } = filters;

    const offset = (page - 1) * limit;
    const where = {};

    if (estado) where.estado = estado;
    if (pnr) where.pnr = { [Op.like]: `%${pnr}%` };
    if (rut) where.rut = { [Op.like]: `%${rut}%` };
    if (categoria) where.categoria = categoria;
    
    const { Reembolso, Usuario } = require('../models');

    if (search) {
        where[Op.or] = [
            { pnr: { [Op.like]: `%${search}%` } },
            { rut: { [Op.like]: `%${search}%` } },
            { correo: { [Op.like]: `%${search}%` } },
            { operador: { [Op.like]: `%${search}%` } }
        ];
    }

    if (gestor) {
        const usuariosMatch = await Usuario.findAll({
            where: { nombre: { [Op.like]: `%${gestor}%` } },
            attributes: ['id']
        });
        const ids = usuariosMatch.map(u => String(u.id));
        
        if (ids.length > 0) {
            where.created_by = {
                [Op.or]: [
                    { [Op.like]: `%${gestor}%` },
                    { [Op.in]: ids }
                ]
            };
        } else {
            where.created_by = { [Op.like]: `%${gestor}%` };
        }
    }

    const { count, rows } = await Reembolso.findAndCountAll({
        where,
        include: [{
            model: Usuario,
            as: 'usuario_creador',
            attributes: ['nombre', 'correo']
        }],
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

/**
 * Obtener gestores únicos
 */
exports.obtenerGestoresUnicos = async () => {
    const { Reembolso, Usuario } = require('../models');
    const gestores = await Reembolso.findAll({
        attributes: ['created_by'],
        group: ['created_by'],
        where: { created_by: { [Op.ne]: null } }
    });
    
    const gestoresUnicos = [];
    
    for (const g of gestores) {
        const value = g.created_by;
        if (!value) continue;
        
        if (/^\d+$/.test(value)) {
            const user = await Usuario.findByPk(value, { attributes: ['nombre'] });
            if (user && user.nombre) {
                if (!gestoresUnicos.includes(user.nombre)) {
                    gestoresUnicos.push(user.nombre);
                }
            } else {
                if (!gestoresUnicos.includes(value)) {
                    gestoresUnicos.push(value);
                }
            }
        } else {
            if (!gestoresUnicos.includes(value)) {
                gestoresUnicos.push(value);
            }
        }
    }
    
    return gestoresUnicos.sort();
};
