const apiRegistroService = require('../services/apiRegistro.service');
const ApiRegistroDTO = require('../dtos/apiRegistro.dto');

exports.crear = async (req, res, next) => {
    try {
        const api = await apiRegistroService.crear(req.body);
        res.status(201).json(new ApiRegistroDTO(api));
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const data = await apiRegistroService.listar(req.query);
        res.json({
            ...data,
            rows: ApiRegistroDTO.list(data.rows)
        });
    } catch (error) {
        next(error);
    }
};

exports.obtener = async (req, res, next) => {
    try {
        const api = await apiRegistroService.obtenerPorId(req.params.id);
        res.json(new ApiRegistroDTO(api));
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const api = await apiRegistroService.actualizar(req.params.id, req.body);
        res.json(new ApiRegistroDTO(api));
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        await apiRegistroService.eliminar(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
