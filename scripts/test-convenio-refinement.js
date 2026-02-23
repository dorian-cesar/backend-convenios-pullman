const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.SWAGGER_BASE_URL || 'http://localhost:3000/api';
let token = '';

async function login() {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            correo: 'admin@pullman.cl',
            password: 'admin'
        });
        token = response.data.token;
        console.log('Logged in successfully');
    } catch (error) {
        console.error('Login failed. Ensure the server is running and admin credentials are correct.');
        process.exit(1);
    }
}

async function runTests() {
    await login();

    try {
        // 1. Get Empresa
        const empRes = await axios.get(`${API_URL}/empresas`, { headers: { Authorization: `Bearer ${token}` } });
        const empresa = empRes.data.rows[0];
        if (!empresa) throw new Error('No empresa found');

        // 2. Create Convenio
        console.log('\n--- Testing Creation ---');
        const createData = {
            nombre: 'Convenio Test Refinement',
            empresa_id: empresa.id,
            tipo_consulta: 'CODIGO_DESCUENTO',
            codigo: 'TEST' + Date.now(),
            porcentaje_descuento: 15,
            fecha_inicio: '2026-06-01T00:00:00Z',
            fecha_termino: '2026-12-31T23:59:59Z'
        };
        const postRes = await axios.post(`${API_URL}/convenios`, createData, { headers: { Authorization: `Bearer ${token}` } });
        const convenio = postRes.data;
        console.log('Created Convenio:', JSON.stringify(convenio, null, 2));

        // 3. Update Convenio (Limits and API)
        console.log('\n--- Testing Update ---');
        // Find or create an API for testing
        const apiRes = await axios.post(`${API_URL}/convenios`, {
            nombre: 'API Ext Temp',
            empresa_id: empresa.id,
            tipo_consulta: 'API_EXTERNA',
            endpoint: 'https://api.test.com/v1'
        }, { headers: { Authorization: `Bearer ${token}` } });
        const apiUrlId = apiRes.data.api_url_id;

        const updateData = {
            nombre: 'Convenio Test Updated',
            api_url_id: apiUrlId,
            tipo_consulta: 'API_EXTERNA',
            tope_monto_ventas: 2500000,
            tope_cantidad_tickets: 100,
            limitar_por_stock: true,
            limitar_por_monto: true
        };

        const putRes = await axios.put(`${API_URL}/convenios/${convenio.id}`, updateData, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Updated Convenio:', JSON.stringify(putRes.data, null, 2));

        if (putRes.data.api_url_id === apiUrlId && putRes.data.tope_monto_ventas === 2500000) {
            console.log('\nSUCCESS: All changes verified correctly.');
        }

    } catch (error) {
        console.error('Test Error:', error.response?.data || error.message);
    }
}

runTests();
