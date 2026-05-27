const { InvalidacionLog } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination.utils');

/**
  * Listar logs de invalidación (con paginación y filtros)
  */
exports.listar = async (req, res, next) => {
    try {
        const { page, limit, rut, pnr, numero_ticket, search, startDate, endDate } = req.query;
        const { offset, limit: limitVal } = getPagination(page, limit);
        
        const where = {};

        // Rango de fechas
        if (startDate || endDate) {
            where.fecha = {};
            if (startDate) where.fecha[Op.gte] = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.fecha[Op.lte] = end;
            }
        }

        // Filtros directos
        if (rut) {
            where.rut = { [Op.like]: `%${rut}%` };
        }
        if (pnr) {
            where.pnr = { [Op.like]: `%${pnr}%` };
        }
        if (numero_ticket) {
            where.numero_ticket = { [Op.like]: `%${numero_ticket}%` };
        }

        // Búsqueda general en mensaje o endpoint
        if (search) {
            where[Op.or] = [
                { error_mensaje: { [Op.like]: `%${search}%` } },
                { endpoint: { [Op.like]: `%${search}%` } }
            ];
        }

        const data = await InvalidacionLog.findAndCountAll({
            where,
            order: [['fecha', 'DESC']],
            limit: limitVal,
            offset
        });

        const response = getPagingData(data, page, limitVal);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener un log de invalidación por ID
 */
exports.obtener = async (req, res, next) => {
    try {
        const { id } = req.params;
        const log = await InvalidacionLog.findByPk(id);
        if (!log) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Log de invalidación no encontrado' });
        }
        res.json(log);
    } catch (error) {
        next(error);
    }
};
