const Joi = require('joi');

const crearCategoria = {
    body: Joi.object().keys({
        nombre: Joi.string().required().max(100),
        empresa_id: Joi.number().integer().required(),
        descripcion: Joi.string().allow('', null).max(255)
    })
};

const actualizarCategoria = {
    params: Joi.object().keys({
        id: Joi.number().integer().required()
    }),
    body: Joi.object().keys({
        nombre: Joi.string().max(100),
        descripcion: Joi.string().allow('', null).max(255)
    }).min(1)
};

const getCategoria = {
    params: Joi.object().keys({
        id: Joi.number().integer().required()
    })
};

module.exports = {
    crearCategoria,
    actualizarCategoria,
    getCategoria
};
