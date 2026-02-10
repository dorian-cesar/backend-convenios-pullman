const AppError = require('./AppError');

class ReglaDeNegocioError extends AppError {
    constructor(message) {
        super(message, 400, 'REGLA_DE_NEGOCIO_ERROR');
    }
}

module.exports = ReglaDeNegocioError;
