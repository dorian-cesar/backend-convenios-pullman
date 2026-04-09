const AppError = require('./AppError');

class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    const message = resource.includes('no encontrado') ? resource : `${resource} no encontrado`;
    super(message, 404, 'NOT_FOUND');
  }
}

module.exports = NotFoundError;
