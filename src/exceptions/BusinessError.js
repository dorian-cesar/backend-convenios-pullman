const AppError = require('./AppError');

class BusinessError extends AppError {
  constructor(message, code = 'BUSINESS_ERROR') {
    super(message, 400, code);
  }
}

module.exports = BusinessError;
