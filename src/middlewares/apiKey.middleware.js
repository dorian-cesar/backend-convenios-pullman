const { ApiKey } = require('../models');
const AuthError = require('../exceptions/AuthError');

module.exports = async (req, res, next) => {
    try {
        const apiKeyHeader = req.headers['x-api-key'];

        if (!apiKeyHeader) {
            throw new AuthError('API Key requerida');
        }

        const apiKeyRecord = await ApiKey.findOne({ where: { key: apiKeyHeader } });

        if (!apiKeyRecord) {
            throw new AuthError('API Key inválida');
        }

        if (apiKeyRecord.status !== 'ACTIVO') {
            throw new AuthError('API Key inactiva');
        }

        // Attach minimal user info for compatibility
        req.user = {
            id: 'API_KEY',
            name: apiKeyRecord.name,
            isApiKey: true
        };

        next();
    } catch (err) {
        next(err);
    }
};
