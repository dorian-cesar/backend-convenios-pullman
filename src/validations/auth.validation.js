const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    correo: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    nombre: Joi.string().required(),
    rut: Joi.string().required(),
    telefono: Joi.string().allow('', null),
  }),
};

module.exports = {
  register,
};
