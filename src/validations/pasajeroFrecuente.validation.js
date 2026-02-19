const Joi = require('joi');
const { validateRut } = require('../utils/rut.utils');

const rutValidation = (value, helpers) => {
    if (!validateRut(value)) {
        return helpers.message('El RUT no es válido');
    }
    return value;
};

const crearPasajeroFrecuente = {
    body: Joi.object().keys({
        nombre: Joi.string().required(),
        rut: Joi.string().required().custom(rutValidation),
        telefono: Joi.string().required(),
        correo: Joi.string().email().required(),
        direccion: Joi.string().required(),
        imagen_cedula_identidad: Joi.string().allow(null, ''),
        imagen_certificado: Joi.string().allow(null, ''), // Nuevo campo
        status: Joi.string().valid('ACTIVO', 'INACTIVO').default('INACTIVO')
    })
};

const actualizarPasajeroFrecuente = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    body: Joi.object().keys({
        nombre: Joi.string(),
        rut: Joi.string().custom(rutValidation),
        telefono: Joi.string(),
        correo: Joi.string().email(),
        direccion: Joi.string(),
        imagen_cedula_identidad: Joi.string().allow(null, ''),
        imagen_certificado: Joi.string().allow(null, ''), // Nuevo campo
        status: Joi.string().valid('ACTIVO', 'INACTIVO')
    }).min(1)
};

const getPasajeroFrecuente = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

const getPorRut = {
    params: Joi.object().keys({
        rut: Joi.string().required().custom(rutValidation)
    })
};

module.exports = {
    crearPasajeroFrecuente,
    actualizarPasajeroFrecuente,
    getPasajeroFrecuente,
    getPorRut
};
