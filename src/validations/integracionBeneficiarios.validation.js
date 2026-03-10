const Joi = require('joi');

const validarBeneficiario = {
    body: Joi.object().keys({
        rut: Joi.string().required().regex(/^[0-9]+-[0-9kKxX]$/).messages({
            'any.required': 'El rut es obligatorio',
            'string.pattern.base': 'El formato del RUT debe ser sin puntos y con guión (ej: 12345678-9)'
        }),
        convenio_id: Joi.number().required().messages({
            'any.required': 'El convenio_id es obligatorio'
        }),
        tipo_beneficio: Joi.string().optional().valid('ESTUDIANTE', 'ADULTO_MAYOR', 'PASAJERO_FRECUENTE', 'CARABINERO', 'FACH')
    })
};

module.exports = {
    validarBeneficiario
};
