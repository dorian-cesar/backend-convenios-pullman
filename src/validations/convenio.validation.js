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
        api_url_id: Joi.number().integer().allow(null).optional(),
        endpoint: Joi.string().allow(null, '').when('tipo_consulta', {
            is: 'API_EXTERNA',
            then: Joi.optional(), // Now optional if api_consulta_id is provided
            otherwise: Joi.optional()
        }),
        tope_monto_descuento: Joi.number().integer().min(0).allow(null),
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
        status: Joi.string().valid('ACTIVO', 'INACTIVO').default('ACTIVO'),
        fecha_inicio: Joi.date().iso().allow(null),
        fecha_termino: Joi.date().iso().allow(null)
    }),
};

const actualizarConvenio = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    body: Joi.object().keys({
        nombre: Joi.string(),
        empresa_id: Joi.number().integer(),
        tipo_consulta: Joi.string().valid('API_EXTERNA', 'CODIGO_DESCUENTO'),
        api_url_id: Joi.number().integer().allow(null),
        api_consulta_id: Joi.number().integer().allow(null),
        endpoint: Joi.string().allow(null, ''),
        tope_monto_descuento: Joi.number().integer().min(0).allow(null),
        tope_cantidad_tickets: Joi.number().integer().min(0).allow(null),
        porcentaje_descuento: Joi.number().integer().min(0).max(100),
        codigo: Joi.string().allow(null, ''),
        limitar_por_stock: Joi.boolean(),
        limitar_por_monto: Joi.boolean(),
        status: Joi.string().valid('ACTIVO', 'INACTIVO'),
        fecha_inicio: Joi.date().iso().allow(null),
        fecha_termino: Joi.date().iso().allow(null)
    }).min(1),
};

const getConvenio = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

module.exports = {
    crearConvenio,
    actualizarConvenio,
    getConvenio
};
