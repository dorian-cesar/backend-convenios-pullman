const { ApiKey } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination.utils');
const BusinessError = require('../exceptions/BusinessError');
const NotFoundError = require('../exceptions/NotFoundError');
const crypto = require('crypto');

exports.crearApiKey = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) throw new BusinessError('El nombre es requerido');

        const existe = await ApiKey.findOne({ where: { name } });
        if (existe) throw new BusinessError('Ya existe una API Key con ese nombre');

        // Generate a secure random key
        const key = crypto.randomBytes(32).toString('hex');

        const apiKey = await ApiKey.create({
            name,
            key,
            status: 'ACTIVO'
        });

        res.status(201).json({
            message: 'API Key creada exitosamente',
            data: apiKey
        });
    } catch (error) {
        next(error);
    }
};

exports.listarApiKeys = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const { offset, limit: limitVal } = getPagination(page, limit);

        const data = await ApiKey.findAndCountAll({
            limit: limitVal,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json(getPagingData(data, page, limitVal));
    } catch (error) {
        next(error);
    }
};

exports.obtenerApiKey = async (req, res, next) => {
    try {
        const { id } = req.params;
        const apiKey = await ApiKey.findByPk(id);
        if (!apiKey) throw new NotFoundError('API Key no encontrada');
        res.json(apiKey);
    } catch (error) {
        next(error);
    }
};

exports.actualizarApiKey = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, status } = req.body;

        const apiKey = await ApiKey.findByPk(id);
        if (!apiKey) throw new NotFoundError('API Key no encontrada');

        if (name) {
            const existe = await ApiKey.findOne({ where: { name, id: { [require('sequelize').Op.ne]: id } } });
            if (existe) throw new BusinessError('Ya existe otra API Key con ese nombre');
            apiKey.name = name;
        }

        if (status) {
            if (!['ACTIVO', 'INACTIVO'].includes(status)) throw new BusinessError('Estatus inválido');
            apiKey.status = status;
        }

        await apiKey.save();
        res.json(apiKey);
    } catch (error) {
        next(error);
    }
};

exports.eliminarApiKey = async (req, res, next) => {
    try {
        const { id } = req.params;
        const apiKey = await ApiKey.findByPk(id);
        if (!apiKey) throw new NotFoundError('API Key no encontrada');

        await apiKey.destroy(); // Hard delete or you can choose soft delete by updating status
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
