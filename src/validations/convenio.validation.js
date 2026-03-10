const Joi = require('joi');

const crearConvenio = {
    body: Joi.object().keys({
        nombre: Joi.string().required().messages({
            'string.empty': 'El nombre es obligatorio',
            'any.required': 'El nombre es obligatorio'
        }),
        empresa_id: Joi.number().integer().required(),
        tipo_consulta: Joi.string().valid('API_EXTERNA', 'CODIGO_DESCUENTO').default('CODIGO_DESCUENTO'),
        api_consulta_id: Joi.number().integer().allow(null).optional(),
        api_url_id: Joi.number().integer().allow(null).optional(),
        endpoint: Joi.string().allow(null, '').when('tipo_consulta', {
            is: 'API_EXTERNA',
            then: Joi.optional(), // Now optional if api_consulta_id is provided
            otherwise: Joi.optional()
        }),
        tope_monto_descuento: Joi.number().integer().min(0).allow(null),
        tope_cantidad_tickets: Joi.number().integer().min(0).allow(null),
        tipo_alcance: Joi.string().valid('Global', 'Rutas Especificas').default('Global'),
        tipo_descuento: Joi.string().valid('Porcentaje', 'Monto Fijo', 'Tarifa Plana').default('Porcentaje'),
        valor_descuento: Joi.number().precision(2).allow(null),
        porcentaje_descuento: Joi.number().integer().min(0).max(100).default(0),
        codigo: Joi.when('tipo_consulta', {
            is: 'CODIGO_DESCUENTO',
            then: Joi.string().required().messages({
                'string.empty': 'El código es obligatorio para este tipo de convenio',
                'any.required': 'El código es obligatorio para este tipo de convenio'
            }),
            otherwise: Joi.any().valid(null).messages({
                'any.only': 'El código debe ser null para convenios de tipo API_EXTERNA'
            })
        }),
        limitar_por_stock: Joi.boolean().default(false),
        limitar_por_monto: Joi.boolean().default(false),
        status: Joi.string().valid('ACTIVO', 'INACTIVO').default('ACTIVO'),
        fecha_inicio: Joi.date().iso().allow(null),
        fecha_inicio: Joi.date().iso().allow(null),
        fecha_termino: Joi.date().iso().allow(null),
        beneficio: Joi.boolean().default(false),
        imagenes: Joi.array().items(Joi.string()).allow(null),
        rutas: Joi.array().items(Joi.object().keys({
            origen_codigo: Joi.string().required(),
            origen_ciudad: Joi.string().required(),
            destino_codigo: Joi.string().required(),
            destino_ciudad: Joi.string().required(),
            configuraciones: Joi.array().items(Joi.object().keys({
                tipo_viaje: Joi.string().valid('Solo Ida', 'Ida y Vuelta').required(),
                tipo_asiento: Joi.string().valid('Semi Cama', 'Cama', 'Premium').required(),
                precio_solo_ida: Joi.number().precision(2).allow(null),
                precio_ida_vuelta: Joi.number().precision(2).allow(null),
                max_pasajes: Joi.number().integer().min(1).allow(null)
            })).optional()
        })).optional()
    }),
};

const actualizarConvenio = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    body: Joi.object().keys({
        nombre: Joi.string(),
        empresa_id: Joi.number().integer(),
        tipo_consulta: Joi.string().valid('API_EXTERNA', 'CODIGO_DESCUENTO'),
        api_url_id: Joi.number().integer().allow(null),
        api_consulta_id: Joi.number().integer().allow(null),
        endpoint: Joi.string().allow(null, ''),
        tope_monto_descuento: Joi.number().integer().min(0).allow(null),
        tope_cantidad_tickets: Joi.number().integer().min(0).allow(null),
        tipo_alcance: Joi.string().valid('Global', 'Rutas Especificas'),
        tipo_descuento: Joi.string().valid('Porcentaje', 'Monto Fijo', 'Tarifa Plana'),
        valor_descuento: Joi.number().precision(2).allow(null),
        porcentaje_descuento: Joi.number().integer().min(0).max(100),
        codigo: Joi.when('tipo_consulta', {
            is: 'API_EXTERNA',
            then: Joi.any().valid(null).messages({
                'any.only': 'El código debe ser null para convenios de tipo API_EXTERNA'
            }),
            otherwise: Joi.string().allow(null, '')
        }),
        limitar_por_stock: Joi.boolean(),
        limitar_por_monto: Joi.boolean(),
        status: Joi.string().valid('ACTIVO', 'INACTIVO'),
        fecha_inicio: Joi.date().iso().allow(null),
        fecha_inicio: Joi.date().iso().allow(null),
        fecha_termino: Joi.date().iso().allow(null),
        beneficio: Joi.boolean(),
        imagenes: Joi.array().items(Joi.string()).allow(null),
        rutas: Joi.array().items(Joi.object().keys({
            origen_codigo: Joi.string(),
            origen_ciudad: Joi.string(),
            destino_codigo: Joi.string(),
            destino_ciudad: Joi.string(),
            configuraciones: Joi.array().items(Joi.object().keys({
                tipo_viaje: Joi.string().valid('Solo Ida', 'Ida y Vuelta'),
                tipo_asiento: Joi.string().valid('Semi Cama', 'Cama', 'Premium'),
                precio_solo_ida: Joi.number().precision(2).allow(null),
                precio_ida_vuelta: Joi.number().precision(2).allow(null),
                max_pasajes: Joi.number().integer().min(1).allow(null)
            }))
        }))
    }).min(1),
};

const getConvenio = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

const validarCodigoConvenio = {
    params: Joi.object().keys({
        codigo: Joi.string().required(),
    }),
    body: Joi.object().keys({
        convenio_id: Joi.number().integer(),
        id: Joi.number().integer()
    }).or('convenio_id', 'id').messages({
        'object.missing': 'Debe proporcionar "convenio_id" o "id" en el cuerpo de la petición.'
    })
};

// --- Configuraciones de Rutas (JSON) ---
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

const agregarRutasMassivas = {
    body: Joi.object().keys({
        rutas: Joi.array().items(rutaSchema).min(1).required().messages({
            'any.required': 'El array de rutas es obligatorio',
            'array.min': 'Se debe proporcionar al menos 1 ruta'
        })
    })
};

module.exports = {
    crearConvenio,
    actualizarConvenio,
    getConvenio,
    validarCodigoConvenio,
    agregarRutasMassivas
};
