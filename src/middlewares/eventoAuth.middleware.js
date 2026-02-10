const jwt = require('jsonwebtoken');
const AuthError = require('../exceptions/AuthError');
const { ApiKey } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const apiKeyHeader = req.headers['x-api-key'];

        // 1. Intentar con JWT
        if (authHeader) {
            try {
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

                req.user = jwt.verify(token, JWT_SECRET);
                return next();
            } catch (err) {
                // Si hay API Key, ignoramos el fallo de JWT y probamos la API Key
                // De lo contrario, lanzamos el error de JWT
                if (!apiKeyHeader) {
                    if (err.name === 'TokenExpiredError') throw new AuthError('Token expirado');
                    if (err instanceof AuthError) throw err;
                    throw new AuthError('Formato de token inválido');
                }
            }
        }

        // 2. Intentar con API Key
        if (apiKeyHeader) {
            const apiKeyRecord = await ApiKey.findOne({ where: { key: apiKeyHeader } });

            if (!apiKeyRecord) {
                throw new AuthError('API Key inválida');
            }

            if (apiKeyRecord.status !== 'ACTIVO') {
                throw new AuthError('API Key inactiva');
            }

            // Populate a minimal user object
            req.user = {
                id: 'API_KEY',
                name: apiKeyRecord.name,
                isApiKey: true,
                rol: 'API_KEY' // Para compatibilidad básica
            };

            return next();
        }

        throw new AuthError('Autenticación requerida (Token o API Key)');
    } catch (err) {
        next(err);
    }
};
