const adultosMayoresService = require('../services/adultosMayores.service');

exports.crear = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.crear(req.body);
        res.status(201).json(adulto);
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorRut = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.obtenerPorRut(req.params.rut);
        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.json(adulto);
    } catch (error) {
        next(error);
    }
};

exports.obtener = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.obtenerPorId(req.params.id);
        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.json(adulto);
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const result = await adultosMayoresService.listar(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.actualizar(req.params.id, req.body);
        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.json(adulto);
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await adultosMayoresService.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.activar = async (req, res, next) => {
    try {
        const adulto = await adultosMayoresService.activar(req.params.id);
        if (!adulto) {
            return res.status(404).json({ message: 'Adulto Mayor no encontrado' });
        }
        res.json(adulto);
    } catch (error) {
        next(error);
    }
};
