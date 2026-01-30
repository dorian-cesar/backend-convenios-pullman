const pasajerosService = require('../services/pasajeros.service');
const PasajeroDTO = require('../dtos/pasajero.dto');

/**
 * Crear pasajero
 */
exports.crear = async (req, res, next) => {
    try {
        const pasajero = await pasajerosService.crearPasajero(req.body);
        res.status(201).json(new PasajeroDTO(pasajero));
    } catch (error) {
        next(error);
    }
};

/**
 * Listar pasajeros
 */
exports.listar = async (req, res, next) => {
    try {
        const pasajeros = await pasajerosService.listarPasajeros(req.query);
        res.json(PasajeroDTO.fromArray(pasajeros));
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener pasajero por ID
 */
exports.obtener = async (req, res, next) => {
    try {
        const { id } = req.params;
        const pasajero = await pasajerosService.obtenerPasajero(id);
        res.json(new PasajeroDTO(pasajero));
    } catch (error) {
        next(error);
    }
};

/**
 * Buscar pasajero por RUT
 */
exports.buscarPorRut = async (req, res, next) => {
    try {
        const { rut } = req.params;
        const pasajero = await pasajerosService.buscarPorRut(rut);
        res.json(new PasajeroDTO(pasajero));
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar pasajero
 */
exports.actualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const pasajero = await pasajerosService.actualizarPasajero(id, req.body);
        res.json(new PasajeroDTO(pasajero));
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar pasajero (soft delete)
 */
exports.eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;
        await pasajerosService.eliminarPasajero(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
