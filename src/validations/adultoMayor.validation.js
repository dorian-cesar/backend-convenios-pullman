const Joi = require('joi');
const { validateRut } = require('../utils/rut.utils');

const rutValidation = (value, helpers) => {
    if (!validateRut(value)) {
        return helpers.message('El RUT no es válido');
    }
    return value;
};

const crearAdultoMayor = {
    body: Joi.object().keys({
        id: Joi.any().strip(), // Ignorar ID si viene en el body
        nombre: Joi.string().required(),
        rut: Joi.string().required().custom(rutValidation),
        telefono: Joi.string().required(),
        correo: Joi.string().email({ tlds: { allow: false } }).allow(null, '').optional(),
        direccion: Joi.string().required(),
        certificado: Joi.string().allow(null, '').optional(), // Número/Código del certificado
        imagen_cedula_identidad: Joi.string().allow(null, ''), // Base64 or URL
        imagen_certificado_residencia: Joi.string().allow(null, ''), // Base64 or URL
        razon_rechazo: Joi.string().allow(null, ''),
        status: Joi.string().valid('ACTIVO', 'INACTIVO', 'RECHAZADO').default('INACTIVO')
    })
};

const actualizarAdultoMayor = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    body: Joi.object().keys({
        nombre: Joi.string(),
        rut: Joi.string().custom(rutValidation),
        telefono: Joi.string(),
        correo: Joi.string().email({ tlds: { allow: false } }),
        direccion: Joi.string(),
        certificado: Joi.string(),
        imagen_cedula_identidad: Joi.string().allow(null, ''),
        imagen_certificado_residencia: Joi.string().allow(null, ''),
        razon_rechazo: Joi.string().allow(null, ''),
        status: Joi.string().valid('ACTIVO', 'INACTIVO', 'RECHAZADO')
    }).min(1)
};

const getAdultoMayor = {
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
    crearAdultoMayor,
    actualizarAdultoMayor,
    getAdultoMayor,
    getPorRut
};
