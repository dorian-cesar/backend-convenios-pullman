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
    // Business errors correspond to Warn/Info usually, not critical logic crashes
    // But we can log them if needed.
    return res.status(err.statusCode).json({
      error: err.code || 'ERROR',
      message: err.message
    });
  }

  // Log critical/unknown errors
  logger.error(err);

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

