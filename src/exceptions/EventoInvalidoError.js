const AppError = require('./AppError');

class EventoInvalidoError extends AppError {
    constructor(message) {
        super(message, 400, 'EVENTO_INVALIDO_ERROR');
    }
}

module.exports = EventoInvalidoError;
