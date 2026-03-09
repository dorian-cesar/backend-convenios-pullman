const Joi = require('joi');

const crearApiRegistro = {
    body: Joi.object().keys({
        nombre: Joi.string().required(),
        endpoint: Joi.string().required(),
        empresa_id: Joi.number().required(),
        status: Joi.string().valid('ACTIVO', 'INACTIVO').default('ACTIVO')
    })
};

const actualizarApiRegistro = {
    params: Joi.object().keys({
        id: Joi.number().required()
    }),
    body: Joi.object().keys({
        nombre: Joi.string(),
        endpoint: Joi.string(),
        empresa_id: Joi.number(),
        status: Joi.string().valid('ACTIVO', 'INACTIVO')
    }).min(1)
};

const obtenerApiRegistro = {
    params: Joi.object().keys({
        id: Joi.number().required()
    })
};

module.exports = {
    crearApiRegistro,
    actualizarApiRegistro,
    obtenerApiRegistro
};
