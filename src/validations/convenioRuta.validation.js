const Joi = require('joi');

const rutaConfigSchema = Joi.object({
    tipo_viaje: Joi.string().valid('Solo Ida', 'Ida y Vuelta').required().messages({
        'any.required': 'El tipo_viaje es obligatorio',
        'any.only': 'El tipo_viaje debe ser "Solo Ida" o "Ida y Vuelta"'
    }),
    tipo_asiento: Joi.string().valid('Semi Cama', 'Cama', 'Premium').required().messages({
        'any.required': 'El tipo_asiento es obligatorio',
        'any.only': 'El tipo_asiento debe ser "Semi Cama", "Cama" o "Premium"'
    }),
    precio_solo_ida: Joi.number().min(0).allow(null).optional().messages({
        'number.min': 'El precio_solo_ida no puede ser negativo'
    }),
    precio_ida_vuelta: Joi.number().min(0).allow(null).optional().messages({
        'number.min': 'El precio_ida_vuelta no puede ser negativo'
    }),
    max_pasajes: Joi.number().integer().min(1).allow(null).optional().messages({
        'number.min': 'El max_pasajes debe ser al menos 1'
    })
});

const rutaSchema = Joi.object({
    origen_codigo: Joi.string().max(10).required().messages({
        'any.required': 'El origen_codigo es obligatorio'
    }),
    origen_ciudad: Joi.string().max(100).required().messages({
        'any.required': 'La origen_ciudad es obligatoria'
    }),
    destino_codigo: Joi.string().max(10).required().messages({
        'any.required': 'El destino_codigo es obligatorio'
    }),
    destino_ciudad: Joi.string().max(100).required().messages({
        'any.required': 'La destino_ciudad es obligatoria'
    }),
    configuraciones: Joi.array().items(rutaConfigSchema).min(1).required().messages({
        'any.required': 'Se requiere al menos una configuración para la ruta',
        'array.min': 'Debe haber al menos 1 configuración por ruta'
    })
});

const agregarRutasMassivas = Joi.object({
    rutas: Joi.array().items(rutaSchema).min(1).required().messages({
        'any.required': 'El array de rutas es obligatorio',
        'array.min': 'Se debe proporcionar al menos 1 ruta'
    })
});

module.exports = {
    agregarRutasMassivas
};
