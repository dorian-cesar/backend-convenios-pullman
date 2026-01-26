const jwt = require('jsonwebtoken');
const AuthError = require('../exceptions/AuthError');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) throw new AuthError('Token no proporcionado');

    const parts = authHeader.trim().split(/\s+/);
    let token;
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      token = parts[1];
    } else if (parts.length === 1) {
      token = parts[0];
    } else {
      throw new AuthError('Formato de token inválido');
    }

    if (!JWT_SECRET) throw new AuthError('JWT_SECRET no configurado');

    try {
      req.user = jwt.verify(token, JWT_SECRET);
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') throw new AuthError('Token expirado');
      throw new AuthError('Formato de token inválido');
    }
  } catch (err) {
    next(err);
  }
};
