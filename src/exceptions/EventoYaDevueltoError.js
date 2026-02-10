const AppError = require('./AppError');

class EventoYaDevueltoError extends AppError {
    constructor(message) {
        super(message, 400, 'EVENTO_YA_DEVUELTO_ERROR');
    }
}

module.exports = EventoYaDevueltoError;
