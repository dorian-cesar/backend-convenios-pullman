const Joi = require('joi');

const crearConvenio = {
    body: Joi.object().keys({
        nombre: Joi.string().required().messages({
            'string.empty': 'El nombre es obligatorio',
            'any.required': 'El nombre es obligatorio'
        }),
        empresa_id: Joi.number().integer().required(),
        tipo_consulta: Joi.string().valid('API_EXTERNA', 'CODIGO_DESCUENTO').default('CODIGO_DESCUENTO'),
        api_consulta_id: Joi.number().integer().allow(null).optional(),
        endpoint: Joi.string().uri().allow(null, '').when('tipo_consulta', {
            is: 'API_EXTERNA',
            then: Joi.optional(), // Now optional if api_consulta_id is provided
            otherwise: Joi.optional()
        }),
        tope_monto_ventas: Joi.number().integer().min(0).allow(null),
        tope_cantidad_tickets: Joi.number().integer().min(0).allow(null),
        porcentaje_descuento: Joi.number().integer().min(0).max(100).default(0),
        codigo: Joi.when('tipo_consulta', {
            is: 'CODIGO_DESCUENTO',
            then: Joi.string().required().messages({
                'string.empty': 'El código es obligatorio para este tipo de convenio',
                'any.required': 'El código es obligatorio para este tipo de convenio'
            }),
            otherwise: Joi.any().strip() // Remove from payload for API_EXTERNA
        }),
        limitar_por_stock: Joi.boolean().default(false),
        limitar_por_monto: Joi.boolean().default(false),
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
