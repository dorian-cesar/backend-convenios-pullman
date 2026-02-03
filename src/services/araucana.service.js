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
        console.log(`[Araucana] Auth URL: ${AUTH_URL}`);

        const params = new URLSearchParams();
        params.append('grant_type', GRANT_TYPE);
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);

        const response = await axios.post(AUTH_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Asumimos que la respuesta trae el access_token
        if (response.data && response.data.access_token) {
            return response.data.access_token;
        } else {
            console.error('Respuesta Auth Araucana inesperada:', response.data);
            throw new Error('No se pudo obtener el token de acceso: respuesta sin access_token.');
        }

    } catch (error) {
        console.error('Error obteniendo token Araucana:', error.message);
        let errorMsg = 'Error de comunicación con servicio de autenticación externo.';
        if (error.response) {
            console.error('Detalle error Auth status:', error.response.status);
            console.error('Detalle error Auth data:', error.response.data);
            errorMsg += ` Status: ${error.response.status}. Msg: ${JSON.stringify(error.response.data)}`;
        }
        throw new BusinessError(errorMsg);
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
            }
        });

        // Respuesta esperada:
        // { "estado": 1001, "nombre": "...", "segmento": {...}, "codRespuesta": 200 }

        return response.data;

    } catch (error) {
        console.error('Error consultando Araucana:', error.message);
        if (error.response) {
            console.error('Detalle error Consulta:', error.response.data);
        }
        throw new BusinessError('Error consultando servicio externo de Araucana.');
    }
};
