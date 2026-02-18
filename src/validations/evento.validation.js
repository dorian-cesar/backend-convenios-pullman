const Joi = require('joi');

const crearCompra = {
    body: Joi.object().keys({
        usuario_id: Joi.number().integer().optional(),
        pasajero_id: Joi.number().integer().required(),
        empresa_id: Joi.number().integer().required(),
        convenio_id: Joi.number().integer().allow(null).optional(),
        ciudad_origen: Joi.string().required(),
        ciudad_destino: Joi.string().required(),
        fecha_viaje: Joi.date().iso().required(),
        hora_salida: Joi.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/).required().messages({
            'string.pattern.base': 'El formato de hora_salida debe ser HH:mm'
        }),
        numero_asiento: Joi.string().allow(null, '').optional(),
        numero_ticket: Joi.string().allow(null, '').optional(),
        pnr: Joi.string().allow(null, '').optional(),
        terminal_origen: Joi.string().allow(null, '').optional(),
        terminal_destino: Joi.string().allow(null, '').optional(),
        tarifa_base: Joi.number().integer().min(0).required(),
        codigo_autorizacion: Joi.string().allow(null, '').optional(),
        token: Joi.string().allow(null, '').optional(),
        estado: Joi.string().valid('confirmado', 'anulado', 'revertido').allow(null).optional()
    })
};



const crearDevolucion = {
    body: Joi.object().keys({
        evento_origen_id: Joi.number().integer().optional(),
        numero_ticket: Joi.string().optional(),
        pnr: Joi.string().optional(),
        usuario_id: Joi.number().integer().optional(),
        monto_devolucion: Joi.number().integer().min(0).optional(),
        estado: Joi.string().valid('confirmado', 'anulado', 'revertido').allow(null).optional(),
        status: Joi.string().valid('confirmado', 'anulado', 'revertido').allow(null).optional()
    }).or('evento_origen_id', 'numero_ticket', 'pnr')
};

module.exports = {
    crearCompra,
    crearDevolucion
};
