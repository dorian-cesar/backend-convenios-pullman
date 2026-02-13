const pasajerosFrecuentesService = require('../services/pasajerosFrecuentes.service');

exports.crear = async (req, res, next) => {
    try {
        const frecuente = await pasajerosFrecuentesService.crear(req.body);
        res.status(201).json(frecuente);
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorRut = async (req, res, next) => {
    try {
        const frecuente = await pasajerosFrecuentesService.obtenerPorRut(req.params.rut);
        if (!frecuente) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }
        res.json(frecuente);
    } catch (error) {
        next(error);
    }
};

exports.obtener = async (req, res, next) => {
    try {
        const frecuente = await pasajerosFrecuentesService.obtenerPorId(req.params.id);
        if (!frecuente) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }
        res.json(frecuente);
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const result = await pasajerosFrecuentesService.listar(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const frecuente = await pasajerosFrecuentesService.actualizar(req.params.id, req.body);
        if (!frecuente) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }
        res.json(frecuente);
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const eliminado = await pasajerosFrecuentesService.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Pasajero Frecuente no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
