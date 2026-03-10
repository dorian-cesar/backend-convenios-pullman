const Joi = require('joi');
const { validateRut } = require('../utils/rut.utils');

const rutValidation = (value, helpers) => {
    if (!validateRut(value)) {
        return helpers.message('El RUT no es válido');
    }
    return value;
};

const crearBeneficiario = {
    body: Joi.object().keys({
        nombre: Joi.string().required(),
        rut: Joi.string().required().custom(rutValidation),
        convenio_id: Joi.number().integer().required(),
        telefono: Joi.string().allow('', null),
        correo: Joi.string().email({ tlds: { allow: false } }).allow('', null),
        direccion: Joi.string().allow('', null),
        imagenes: Joi.object().unknown(true).allow(null),
        status: Joi.string().valid('ACTIVO', 'INACTIVO', 'RECHAZADO').default('INACTIVO'),
        razon_rechazo: Joi.string().allow('', null)
    })
};

const actualizarBeneficiario = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    body: Joi.object().keys({
        nombre: Joi.string(),
        rut: Joi.string().custom(rutValidation),
        convenio_id: Joi.number().integer(),
        telefono: Joi.string().allow('', null),
        correo: Joi.string().email({ tlds: { allow: false } }).allow('', null),
        direccion: Joi.string().allow('', null),
        imagenes: Joi.object().unknown(true).allow(null),
        status: Joi.string().valid('ACTIVO', 'INACTIVO', 'RECHAZADO'),
        razon_rechazo: Joi.string().allow('', null)
    }).min(1)
};

const getBeneficiario = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

const getPorRut = {
    params: Joi.object().keys({
        rut: Joi.string().required().custom(rutValidation)
    }),
    query: Joi.object().keys({
        convenio_id: Joi.number().integer()
    })
};

module.exports = {
    crearBeneficiario,
    actualizarBeneficiario,
    getBeneficiario,
    getPorRut
};
