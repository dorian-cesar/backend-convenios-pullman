const { ValidationError, UniqueConstraintError } = require('sequelize');
const ValidationAppError = require('../exceptions/ValidationError');

module.exports = (err, req, res, next) => {

  if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
    return next(
      new ValidationAppError(
        'Error de validación',
        err.errors.map(e => ({
          campo: e.path,
          mensaje: e.message
        }))
      )
    );
  }

  next(err);
};
