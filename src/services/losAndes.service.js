const axios = require('axios');
const BusinessError = require('../exceptions/BusinessError');
require('dotenv').config();

const GET_TOKEN_URL = process.env.GET_TOKEN_ANDES || 'https://api-dev.cajalosandes.cl/oauth/token';
const CONSULTA_RUT_URL = process.env.CONSULTA_RUT_ANDES || 'https://api-dev.cajalosandes.cl/apoyo/afiliaciones/v2';
const KEY_ANDES = process.env.KEY_ANDES;
const SECRET_ANDES = process.env.SECRET_ANDES;

/**
 * Obtener token de autenticación para Caja Los Andes
 * Utiliza Basic Auth con Key y Secret
 */
const obtenerToken = async () => {
    try {
        if (!KEY_ANDES || !SECRET_ANDES) {
            throw new Error('KEY_ANDES o SECRET_ANDES no están definidos en el entorno.');
        }

        const authString = Buffer.from(`${KEY_ANDES}:${SECRET_ANDES}`).toString('base64');
        const url = GET_TOKEN_URL;

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');

        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authString}`
            }
        });

        if (response.data && response.data.access_token) {
            return response.data.access_token;
        } else {
            console.error('[Los Andes] Respuesta Auth inesperada:', response.data);
            throw new Error('No se pudo obtener el token de acceso.');
        }

    } catch (error) {
        console.error('[Los Andes] Error obteniendo token:', error.message);
        let errorMsg = 'Error de comunicación con servicio de autenticación de Caja Los Andes.';
        if (error.response) {
            console.error('[Los Andes] Detalle error Auth status:', error.response.status);
            errorMsg += ` Status: ${error.response.status}.`;
        }
        throw new BusinessError(errorMsg);
    }
};

/**
 * Consultar estado de persona en Caja Los Andes
 * @param {string} rut - RUT sin puntos, sin guión y sin DV (ej: 12345678)
 */
exports.consultarAfiliacion = async (rut) => {
    // El RUT debe venir limpio (solo números, sin DV) según la documentación de la API
    const token = await obtenerToken();
    const url = `${CONSULTA_RUT_URL}/${rut}/estado`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        console.error('[Los Andes] Error consultando afiliación:', error.message);
        let errorMsg = 'Error consultando servicio externo de Caja Los Andes.';
        if (error.response) {
            console.error('[Los Andes] Detalle error Consulta status:', error.response.status);
            console.error('[Los Andes] Detalle error Consulta data:', error.response.data);
            errorMsg += ` Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data)}`;
        } else {
            errorMsg += ` ${error.message}`;
        }
        throw new BusinessError(errorMsg);
    }
};
