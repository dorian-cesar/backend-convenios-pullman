const beneficioService = require('../services/beneficio.service');
const pasajerosService = require('../services/pasajeros.service');

exports.crear = async (req, res, next) => {
    try {
        const beneficio = await beneficioService.crear(req.body);
        res.status(201).json(beneficio);
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorRut = async (req, res, next) => {
    try {
        const { rut } = req.params;
        const { convenio_id } = req.query;
        const beneficio = await beneficioService.obtenerPorRut(rut, convenio_id);
        if (!beneficio) {
            return res.status(404).json({ message: 'Beneficio no encontrado' });
        }
        res.json(beneficio);
    } catch (error) {
        next(error);
    }
};

exports.obtener = async (req, res, next) => {
    try {
        const beneficio = await beneficioService.obtenerPorId(req.params.id);
        if (!beneficio) {
            return res.status(404).json({ message: 'Beneficio no encontrado' });
        }
        res.json(beneficio);
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const result = await beneficioService.listar(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const beneficio = await beneficioService.actualizar(req.params.id, req.body);
        if (!beneficio) {
            return res.status(404).json({ message: 'Beneficio no encontrado' });
        }
        res.json(beneficio);
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await beneficioService.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Beneficio no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

exports.activar = async (req, res, next) => {
    try {
        const beneficio = await beneficioService.activar(req.params.id);
        if (!beneficio) {
            return res.status(404).json({ message: 'Beneficio no encontrado' });
        }
        res.json(beneficio);
    } catch (error) {
        next(error);
    }
};
