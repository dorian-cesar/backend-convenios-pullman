const apiConsultaService = require('../services/apiConsulta.service');
const ApiConsultaDTO = require('../dtos/apiConsulta.dto');

exports.crear = async (req, res, next) => {
    try {
        const api = await apiConsultaService.crear(req.body);
        res.status(201).json(new ApiConsultaDTO(api));
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const data = await apiConsultaService.listar(req.query);
        res.json({
            ...data,
            rows: ApiConsultaDTO.list(data.rows)
        });
    } catch (error) {
        next(error);
    }
};

exports.obtener = async (req, res, next) => {
    try {
        const api = await apiConsultaService.obtenerPorId(req.params.id);
        res.json(new ApiConsultaDTO(api));
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const api = await apiConsultaService.actualizar(req.params.id, req.body);
        res.json(new ApiConsultaDTO(api));
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        await apiConsultaService.eliminar(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
