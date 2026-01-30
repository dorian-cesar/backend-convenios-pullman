const convenioService = require('../services/convenio.service');
const ConvenioDTO = require('../dtos/convenio.dto');

/**
 * Crear convenio
 */
exports.crear = async (req, res, next) => {
    try {
        const convenio = await convenioService.crearConvenio(req.body);
        res.status(201).json(new ConvenioDTO(convenio));
    } catch (error) {
        next(error);
    }
};

/**
 * Listar convenios
 */
exports.listar = async (req, res, next) => {
    try {
        const result = await convenioService.listarConvenios(req.query);
        const response = {
            ...result,
            rows: ConvenioDTO.fromArray(result.rows)
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener convenio por ID
 */
exports.obtener = async (req, res, next) => {
    try {
        const { id } = req.params;
        const convenio = await convenioService.obtenerConvenio(id);
        res.json(new ConvenioDTO(convenio));
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar convenio
 */
exports.actualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const convenio = await convenioService.actualizarConvenio(id, req.body);
        res.json(new ConvenioDTO(convenio));
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar convenio (soft delete)
 */
exports.eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;
        await convenioService.eliminarConvenio(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
