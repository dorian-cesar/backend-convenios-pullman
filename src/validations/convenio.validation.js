const Joi = require('joi');

const crearConvenio = {
    body: Joi.object().keys({
        nombre: Joi.string().required().messages({
            'string.empty': 'El nombre es obligatorio',
            'any.required': 'El nombre es obligatorio'
        }),
        empresa_id: Joi.number().integer().required(),
        tipo_consulta: Joi.string().valid('API_EXTERNA', 'CODIGO_DESCUENTO').default('CODIGO_DESCUENTO'),
        endpoint: Joi.string().uri().allow(null, ''),
        tope_monto_ventas: Joi.number().integer().min(0).allow(null),
        tope_cantidad_tickets: Joi.number().integer().min(0).allow(null),
        status: Joi.string().valid('ACTIVO', 'INACTIVO').default('ACTIVO')
    }),
};

const getConvenio = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

module.exports = {
    crearConvenio,
    getConvenio
};
