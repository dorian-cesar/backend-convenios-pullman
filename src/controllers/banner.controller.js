const { Banner, Configuracion } = require('../models');
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

exports.crear = async (req, res, next) => {
    try {
        const { list_type, order } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Debe subir una imagen' });
        }
        if (!list_type || !['A', 'B'].includes(list_type)) {
            return res.status(400).json({ error: 'list_type debe ser A o B' });
        }

        const image_url = `/uploads/banners/${file.filename}`;
        
        const banner = await Banner.create({
            image_url,
            list_type,
            order: list_type === 'A' ? parseInt(order) || 0 : null,
            status: 'ACTIVO',
            created_by: req.user ? req.user.id : null
        });

        res.status(201).json(banner);
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const banners = await Banner.findAll({
            order: [
                ['list_type', 'ASC'],
                ['order', 'ASC'],
                ['createdAt', 'DESC']
            ]
        });
        res.json(banners);
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { list_type, order, status } = req.body;

        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ error: 'Banner no encontrado' });
        }

        if (list_type) banner.list_type = list_type;
        if (order !== undefined) banner.order = list_type === 'A' || banner.list_type === 'A' ? parseInt(order) || 0 : null;
        if (status) banner.status = status;

        banner.updated_by = req.user ? req.user.id : null;

        await banner.save();
        res.json(banner);
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ error: 'Banner no encontrado' });
        }
        banner.deleted_by = req.user ? req.user.id : null;
        await banner.save(); // save deleted_by before destroy
        await banner.destroy();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.obtenerHeroBanners = async (req, res, next) => {
    try {
        // Obtener configuraciones
        const confA = await Configuracion.findOne({ where: { clave: 'HERO_LISTA_A_COUNT' } });
        const confB = await Configuracion.findOne({ where: { clave: 'HERO_LISTA_B_COUNT' } });

        const countA = confA ? parseInt(confA.valor) : 4;
        const countB = confB ? parseInt(confB.valor) : 4;

        // Banners Lista A: fijos según orden
        const bannersA = await Banner.findAll({
            where: { list_type: 'A', status: 'ACTIVO' },
            order: [['order', 'ASC']],
            limit: countA
        });

        // Banners Lista B: aleatorios
        const bannersB = await Banner.findAll({
            where: { list_type: 'B', status: 'ACTIVO' },
            order: Sequelize.literal('RAND()'),
            limit: countB
        });

        // Combinar. Según el plan, primero A y luego B.
        const heroBanners = [...bannersA, ...bannersB];

        res.json(heroBanners);
    } catch (error) {
        next(error);
    }
};
