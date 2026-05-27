const logger = require('../utils/logger');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const AppError = require('../exceptions/AppError');
const ValidationAppError = require('../exceptions/ValidationError');

module.exports = (err, req, res, next) => {
  // Guardar log de invalidación si ocurre en endpoints de eventos o reembolsos al haber fallado alguna regla o validación
  const isEventPath = req.path && (req.path.includes('/eventos') || req.path.includes('/reembolsos'));
  if (isEventPath) {
    try {
      const { InvalidacionLog } = require('../models');
      const payload = req.body || {};
      
      // Intentar extraer RUT, PNR y Ticket para indexado y filtrado rápido
      let rut = payload.rut || payload.pasajero_rut;
      if (!rut && typeof payload.pasajero_id === 'string') {
        rut = payload.pasajero_id;
      }
      const pnr = payload.pnr;
      const numero_ticket = payload.numero_ticket || payload.ticket;
      
      const user_identifier = req.user ? (req.user.nombre || req.user.correo || String(req.user.id)) : 'system/api';

      InvalidacionLog.create({
        endpoint: req.originalUrl || req.path,
        metodo: req.method,
        rut: rut || null,
        pnr: pnr || null,
        numero_ticket: numero_ticket || null,
        error_mensaje: err.message || String(err),
        payload: payload,
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        user_identifier: user_identifier
      }).catch(logErr => console.error('[LOGGER] Error al escribir log de invalidación en DB:', logErr.message));

    } catch (logErr) {
      console.error('[LOGGER] Error al preparar inserción de log:', logErr.message);
    }
  }
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
    try {
      logger.error(err.message || err);
      if (err.stack) logger.error(err.stack);
    } catch (logErr) {
      console.error('Logger failed:', logErr);
      console.error('Original Error:', err.message || err);
    }
  }

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');

  res.status(statusCode).json({
    error: errorCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

