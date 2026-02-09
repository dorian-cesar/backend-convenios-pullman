const Joi = require('joi');

const crearApiConsulta = {
    body: Joi.object().keys({
        nombre: Joi.string().required().messages({
            'string.empty': 'El nombre es obligatorio',
            'any.required': 'El nombre es obligatorio'
        }),
        endpoint: Joi.string().required().messages({
            'string.empty': 'El endpoint es obligatorio',
            'any.required': 'El endpoint es obligatorio'
        }),
        empresa_id: Joi.number().integer().allow(null).optional(),
        status: Joi.string().valid('ACTIVO', 'INACTIVO').default('ACTIVO')
    })
};

const actualizarApiConsulta = {
    params: Joi.object().keys({
        id: Joi.number().integer().required()
    }),
    body: Joi.object().keys({
        nombre: Joi.string(),
        endpoint: Joi.string(),
        empresa_id: Joi.number().integer().allow(null),
        status: Joi.string().valid('ACTIVO', 'INACTIVO')
    }).min(1)
};

const obtenerApiConsulta = {
    params: Joi.object().keys({
        id: Joi.number().integer().required()
    })
};

module.exports = {
    crearApiConsulta,
    actualizarApiConsulta,
    obtenerApiConsulta
};
