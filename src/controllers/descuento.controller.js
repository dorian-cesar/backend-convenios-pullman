const descuentoService = require('../services/descuento.service');
const DescuentoDTO = require('../dtos/descuento.dto');

/**
 * Crear descuento
 */
exports.crear = async (req, res, next) => {
    try {
        const descuento = await descuentoService.crearDescuento(req.body);
        res.status(201).json(new DescuentoDTO(descuento));
    } catch (error) {
        next(error);
    }
};

/**
 * Listar descuentos
 */
exports.listar = async (req, res, next) => {
    try {
        const result = await descuentoService.listarDescuentos(req.query);
        const response = {
            ...result,
            rows: DescuentoDTO.fromArray(result.rows)
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener descuento por ID
 */
exports.obtener = async (req, res, next) => {
    try {
        const { id } = req.params;
        const descuento = await descuentoService.obtenerDescuento(id);
        res.json(new DescuentoDTO(descuento));
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar descuento
 */
exports.actualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const descuento = await descuentoService.actualizarDescuento(id, req.body);
        res.json(new DescuentoDTO(descuento));
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar descuento (soft delete)
 */
exports.eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;
        await descuentoService.eliminarDescuento(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
