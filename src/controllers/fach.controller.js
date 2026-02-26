const fachService = require('../services/fach.service');
const FachDTO = require('../dtos/fach.dto');
const { formatRut } = require('../utils/rut.utils');
exports.crear = async (req, res, next) => {
    try {
        const registro = await fachService.crear(req.body);
        res.status(201).json(new FachDTO(registro));
    } catch (error) {
        next(error);
    }
};

exports.listarTodos = async (req, res, next) => {
    try {
        const result = await fachService.obtenerTodos(req.query);
        // Transformar los arrays mediante el DTO para limpiarlos
        const dtodata = result.data.map(item => new FachDTO(item));

        res.json({
            totalItems: result.totalItems,
            data: dtodata,
            totalPages: result.totalPages,
            currentPage: result.currentPage
        });
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorRut = async (req, res, next) => {
    try {
        const registro = await fachService.obtenerPorRut(req.params.rut);
        res.json(new FachDTO(registro));
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const registro = await fachService.actualizar(req.params.rut, req.body);
        res.json(new FachDTO(registro));
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const resultado = await fachService.eliminar(req.params.rut);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

exports.cambiarEstado = async (req, res, next) => {
    try {
        const registro = await fachService.cambiarEstado(req.params.rut);
        res.json(new FachDTO(registro));
    } catch (error) {
        next(error);
    }
};
