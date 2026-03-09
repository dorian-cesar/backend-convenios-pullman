const Joi = require('joi');
const { validateRut } = require('../utils/rut.utils');

const rutValidation = (value, helpers) => {
    if (!validateRut(value)) {
        return helpers.message('El RUT no es válido');
    }
    return value;
};

const validarBeneficiario = {
    body: Joi.object().keys({
        rut: Joi.string().required().custom(rutValidation).messages({
            'any.required': 'El rut es obligatorio'
        }),
        convenioId: Joi.number().required().messages({
            'any.required': 'El convenioId es obligatorio'
        }),
        tipo_beneficio: Joi.string().optional().valid('ESTUDIANTE', 'ADULTO_MAYOR', 'PASAJERO_FRECUENTE', 'CARABINERO', 'FACH')
    })
};

module.exports = {
    validarBeneficiario
};
