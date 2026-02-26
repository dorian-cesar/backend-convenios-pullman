const Joi = require('joi');
const { validateRut } = require('../utils/rut.utils');

const rutValidator = (value, helpers) => {
    // Validar el dígito verificador y formato matemático con módulo 11
    if (!validateRut(value)) {
        return helpers.message('El RUT ingresado no es válido');
    }
    return value;
};

// Rutina estricta regex: número(s), guion, dígito o K (sin puntos)
const rutPattern = /^[0-9]+-[0-9Kk]{1}$/;

const schemas = {
    crear: Joi.object({
        rut: Joi.string()
            .pattern(rutPattern)
            .custom(rutValidator, 'Validación Matemática de RUT')
            .required()
            .messages({
                'string.pattern.base': 'El RUT debe tener el formato 12345678-9 (sin puntos, e incluir el guion)'
            }),
        nombre_completo: Joi.string().min(3).max(255).allow(null, '').optional(),
        empresa_id: Joi.number().integer().positive().allow(null).optional(),
        convenio_id: Joi.number().integer().positive().allow(null).optional(),
        status: Joi.string().valid('ACTIVO', 'INACTIVO').optional()
    }),

    actualizar: Joi.object({
        nombre_completo: Joi.string().min(3).max(255).allow(null, '').optional(),
        empresa_id: Joi.number().integer().positive().allow(null).optional(),
        convenio_id: Joi.number().integer().positive().allow(null).optional(),
        status: Joi.string().valid('ACTIVO', 'INACTIVO').optional()
    }).min(1),

    listar: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        rut: Joi.string().optional(),
        search: Joi.string().optional(),
        status: Joi.string().valid('ACTIVO', 'INACTIVO').optional()
    }),

    validar: Joi.object({
        rut: Joi.string()
            .pattern(rutPattern)
            .custom(rutValidator, 'Validación Matemática de RUT')
            .required()
            .messages({
                'string.pattern.base': 'El RUT debe tener el formato 12345678-9 (sin puntos, e incluir el guion)'
            })
    })
};

module.exports = schemas;
