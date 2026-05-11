const axios = require('axios');
const BusinessError = require('../exceptions/BusinessError');
require('dotenv').config();

const AUTH_URL = process.env.get_token_araucana || 'https://api.araucana.cl/auth/token';
const CONSULTA_URL = process.env.consulta_rut_araucana || 'https://api.araucana.cl/consulta/afiliado';
// Nota: user definió 'clien_id' (sin t) en el .env
const CLIENT_ID = process.env.clien_id || process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const GRANT_TYPE = process.env.grant_type || 'client_credentials';

/**
 * Obtener token de autenticación (x-www-form-urlencoded)
 */
const obtenerToken = async () => {
    try {
        console.log(`[Araucana] Intentando obtener token - URL: ${AUTH_URL}`);

        const params = new URLSearchParams();
        params.append('grant_type', GRANT_TYPE);
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);

        const response = await axios.post(AUTH_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 5000 // Timeout para no quedar colgados
        });

        if (response.data && response.data.access_token) {
            return response.data.access_token;
        } else {
            console.error('[Araucana] Respuesta de autenticación sin access_token:', response.data);
            return null;
        }

    } catch (error) {
        console.error('[Araucana] ❌ Error en autenticación:', error.message);
        if (error.response) {
            console.error(`[Araucana] Detalle status: ${error.response.status} - Data:`, JSON.stringify(error.response.data));
        }
        // Retornamos null en lugar de lanzar error para que el flujo superior lo maneje
        return null;
    }
};

/**
 * Consultar si es beneficiario/afiliado
 */
exports.consultarBeneficiario = async (rutFull) => {
    // 1. Separar RUT y DV
    // Formato esperado input: "12345678-9" o "123456789"
    // Limpiamos puntos y guión
    const limpio = rutFull.replace(/\./g, '').replace(/-/g, '');
    const rutNum = limpio.slice(0, -1);
    const dv = limpio.slice(-1).toUpperCase();

    // 2. Obtener Token
    const token = await obtenerToken();
    if (!token) {
        return { 
            afiliado: false, 
            mensaje: 'No se pudo autenticar con el servicio de La Araucana en este momento.',
            error_detalle: 'AUTH_FAILED'
        };
    }

    // 3. Consultar API
    try {
        const payload = {
            rut: parseInt(rutNum),
            dv: dv
        };

        const response = await axios.post(CONSULTA_URL, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 7000
        });

        return response.data;

    } catch (error) {
        console.error('[Araucana] ❌ Error consultando afiliado:', error.message);
        if (error.response) {
            console.error('[Araucana] Detalle error Consulta:', error.response.data);
        }
        
        // Retornamos un objeto de error amigable en lugar de lanzar una excepción fatal
        return { 
            afiliado: false, 
            mensaje: 'El servicio externo de La Araucana no responde o devolvió un error.',
            error_detalle: error.message
        };
    }
};
