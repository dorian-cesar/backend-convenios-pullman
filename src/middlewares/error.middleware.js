const logger = require('../utils/logger');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const AppError = require('../exceptions/AppError');
const ValidationAppError = require('../exceptions/ValidationError');

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
      message: err.message,
      errors: err.errors || undefined
    });
  }

  // Log critical/unknown errors
  if (!err.statusCode && !err.status) {
    logger.error(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');

  res.status(statusCode).json({
    error: errorCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

