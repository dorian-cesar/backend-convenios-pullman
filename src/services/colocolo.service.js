const axios = require('axios');
const BusinessError = require('../exceptions/BusinessError');
require('dotenv').config();

const SIGNIN_URL = process.env.SIGNIN_COLOCOLO_URL;
const STATUS_URL = process.env.STATUS_COLOCOLO_URL;
const USERNAME = process.env.USERNAME_COLOCOLO;
const PASSWORD = process.env.PASSWORD_COLOCOLO;

// Variables para caché de token
let cachedToken = null;
let tokenExpiresAt = null;

const obtenerToken = async () => {
    try {
        const ahora = new Date();
        if (cachedToken && tokenExpiresAt && ahora < (tokenExpiresAt - 60000)) {
            return cachedToken;
        }

        if (!USERNAME || !PASSWORD || !SIGNIN_URL) {
            throw new Error('Variables de entorno (USERNAME, PASSWORD o SIGNIN_URL) no definidas para Colo Colo.');
        }

        const response = await axios.post(SIGNIN_URL, {
            username: USERNAME,
            password: PASSWORD
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.token) {
            cachedToken = response.data.token;
            // Token de Cognito por lo general dura 1 hora (3600s)
            tokenExpiresAt = new Date(Date.now() + 3600000); 
            return cachedToken;
        } else {
            throw new Error('No se pudo obtener el token de acceso.');
        }

    } catch (error) {
        console.error('[Colo Colo] Error obteniendo token:', error.message);
        let errorMsg = 'Error de comunicación con servicio de autenticación de Colo Colo.';
        if (error.response) {
            console.error('[Colo Colo] Detalle error Auth status:', error.response.status);
            errorMsg += ` Status: ${error.response.status}.`;
        }
        throw new BusinessError(errorMsg);
    }
};

exports.consultarAfiliacion = async (rut) => {
    const token = await obtenerToken();

    if (!STATUS_URL) {
        throw new Error('Variable de entorno STATUS_COLOCOLO_URL no definida.');
    }

    try {
        const response = await axios.post(STATUS_URL, {
            rut: rut
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        console.error('[Colo Colo] Error consultando estado de socio:', error.message);
        let errorMsg = 'Error consultando servicio externo de Colo Colo.';
        if (error.response) {
            errorMsg += ` Status: ${error.response.status}.`;
        } else {
            errorMsg += ` ${error.message}`;
        }
        throw new BusinessError(errorMsg);
    }
};
