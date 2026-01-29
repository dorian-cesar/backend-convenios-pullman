const { ValidationError, UniqueConstraintError } = require('sequelize');
const ValidationAppError = require('../exceptions/ValidationError');
const AppError = require('../exceptions/AppError');

module.exports = (err, req, res, next) => {
  // Convert sequelize validation/unique errors into ValidationAppError
  if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
    const validationErr = new ValidationAppError(
      'Error de validación',
      err.errors.map(e => ({ campo: e.path, mensaje: e.message }))
    );
    err = validationErr;
  }

  // If it's an AppError (business/operational), respond with its status and message
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code || 'ERROR',
      message: err.message
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: err.message,
    stack: err.stack
  });
};
