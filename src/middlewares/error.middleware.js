const AppError = require('../exceptions/AppError');

module.exports = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message
    });
  }

  console.error(err); // log real

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Error interno del servidor'
  });
};
