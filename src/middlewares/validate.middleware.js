const Joi = require('joi');
const ValidationAppError = require('../exceptions/ValidationError');

const validate = (schema) => (req, res, next) => {
    // If schema has multiple parts (body, query, params)
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));

    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((details) => ({
            campo: details.path.join('.'),
            mensaje: details.message
        }));
        return next(new ValidationAppError('Error de Validación', errorMessage));
    }

    // Assign validated values back to req
    Object.assign(req, value);
    return next();
};

const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

module.exports = validate;
