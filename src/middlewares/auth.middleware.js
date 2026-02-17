const jwt = require('jsonwebtoken');
const AuthError = require('../exceptions/AuthError');
const { ApiKey } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const apiKeyHeader = req.headers['x-api-key'];

    // console.log('AuthDebug: Received Headers:', {
    //   auth: authHeader ? 'Present' : 'Missing',
    //   apiKey: apiKeyHeader ? 'Present' : 'Missing',
    //   // headers: req.headers // Uncomment for full noise
    // });

    // 1. Try JWT
    if (authHeader) {
      try {
        let token;
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.slice(7, authHeader.length);
        } else {
          // Soporte para enviar solo el token sin prefijo (legacy/dev)
          token = authHeader;
        }

        if (!token) throw new AuthError('Formato de token inválido');

        if (!JWT_SECRET) {
          console.error('CRITICAL: JWT_SECRET is not defined in environment variables.');
          throw new AuthError('Error de configuración del servidor (JWT_SECRET)');
        }

        req.user = jwt.verify(token, JWT_SECRET);
        return next();
      } catch (err) {
        // console.error('JWT Verification Error:', err.message); // Debug log

        // If JWT fails but there is no API Key, throw error
        if (!apiKeyHeader) {
          if (err.name === 'TokenExpiredError') throw new AuthError('Token expirado');
          if (err.name === 'JsonWebTokenError') throw new AuthError('Token inválido o malformado');
          if (err instanceof AuthError) throw err;
          throw new AuthError('Error de autenticación: ' + err.message);
        }
        // If there is an API key, we continue to check it instead of failing immediately on JWT
      }
    }

    // 2. Try API Key
    if (apiKeyHeader) {
      const apiKeyRecord = await ApiKey.findOne({ where: { key: apiKeyHeader } });

      if (!apiKeyRecord) {
        throw new AuthError('API Key inválida');
      }

      if (apiKeyRecord.status !== 'ACTIVO') {
        throw new AuthError('API Key inactiva');
      }

      // Populate a minimal user object for convenience, if needed
      req.user = {
        id: 'API_KEY',
        name: apiKeyRecord.name,
        isApiKey: true
      };

      return next();
    }

    throw new AuthError('Autenticación requerida (Token o API Key)');
  } catch (err) {
    next(err);
  }
};
