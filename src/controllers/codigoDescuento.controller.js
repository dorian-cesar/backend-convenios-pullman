const codigoDescuentoService = require('../services/codigoDescuento.service');
const CodigoDescuentoDTO = require('../dtos/codigoDescuento.dto');

/**
 * Crear código de descuento
 */
exports.crear = async (req, res, next) => {
    try {
        const codigo = await codigoDescuentoService.crearCodigoDescuento(req.body);
        res.status(201).json(new CodigoDescuentoDTO(codigo));
    } catch (error) {
        next(error);
    }
};

/**
 * Listar códigos de descuento
 */
exports.listar = async (req, res, next) => {
    try {
        const codigos = await codigoDescuentoService.listarCodigosDescuento(req.query);
        res.json(CodigoDescuentoDTO.fromArray(codigos));
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener código de descuento por ID
 */
exports.obtener = async (req, res, next) => {
    try {
        const { id } = req.params;
        const codigo = await codigoDescuentoService.obtenerCodigoDescuento(id);
        res.json(new CodigoDescuentoDTO(codigo));
    } catch (error) {
        next(error);
    }
};

/**
 * Buscar código de descuento por código
 */
exports.buscarPorCodigo = async (req, res, next) => {
    try {
        const { codigo } = req.params;
        const codigoDescuento = await codigoDescuentoService.buscarPorCodigo(codigo);
        res.json(new CodigoDescuentoDTO(codigoDescuento));
    } catch (error) {
        next(error);
    }
};

/**
 * Validar y usar código de descuento
 */
exports.validarYUsar = async (req, res, next) => {
    try {
        const { codigo } = req.body;
        const codigoDescuento = await codigoDescuentoService.validarYUsarCodigo(codigo);
        res.json(new CodigoDescuentoDTO(codigoDescuento));
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar código de descuento
 */
exports.actualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const codigo = await codigoDescuentoService.actualizarCodigoDescuento(id, req.body);
        res.json(new CodigoDescuentoDTO(codigo));
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar código de descuento (soft delete)
 */
exports.eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;
        await codigoDescuentoService.eliminarCodigoDescuento(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
