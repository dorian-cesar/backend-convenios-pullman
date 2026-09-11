const request = require('supertest');
const app = require('../app');
const { sequelize, Empresa, Convenio } = require('../models');

jest.setTimeout(30000);

describe('Convenios API', () => {
    let token;
    let empresaId;

    beforeAll(async () => {
        await sequelize.sync();

        // Login as admin
        const authRes = await request(app)
            .post('/api/auth/login')
            .send({
                correo: 'admin@pullman.cl',
                password: 'Admin1234'
            });
        token = authRes.body.token;

        // Crear API Key para pruebas de endpoints públicos
        const { ApiKey } = require('../models');
        await ApiKey.findOrCreate({
            where: { key: 'TEST_API_KEY_123' },
            defaults: { name: 'Test Key', status: 'ACTIVO' }
        });

        // Limpiar datos previos
        await Empresa.destroy({ where: { nombre: 'Empresa Para Convenio' } });

        // Crear empresa para el convenio
        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '88888888-8' },
            defaults: { nombre: 'Empresa Para Convenio', status: 'ACTIVO' }
        });
        empresaId = empresa.id;

        // Limpiar convenios de prueba anteriores
        await Convenio.destroy({ where: { nombre: 'Convenio Test Nuevo' } });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('GET /api/convenios', () => {
        it('debería listar convenios', async () => {
            const res = await request(app)
                .get('/api/convenios')
                .set('x-api-key', 'TEST_API_KEY_123');

            if (res.statusCode !== 200) console.log('DEBUG CONVENIO GET ERROR:', res.body);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.rows)).toBe(true);
        });
    });

    describe('POST /api/convenios', () => {
        it('debería crear un convenio exitosamente', async () => {
            const res = await request(app)
                .post('/api/convenios')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nombre: 'Convenio Test Nuevo',
                    empresa_id: empresaId
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.nombre).toBe('Convenio Test Nuevo');
            expect(res.body.empresa_id).toBe(empresaId);
        });

        it('debería fallar si falta el nombre', async () => {
            const res = await request(app)
                .post('/api/convenios')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    empresa_id: empresaId
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('PUT /api/convenios/:id', () => {
        it('debería actualizar un convenio', async () => {
            // Primero crear uno para actualizar
            const temp = await Convenio.create({ nombre: 'Temp', empresa_id: empresaId });

            const res = await request(app)
                .put(`/api/convenios/${temp.id}`)
                .set('Authorization', `Bearer ${token}`)
                .set('x-api-key', 'TEST_API_KEY_123')
                .send({
                    nombre: 'Convenio Actualizado'
                });

            if (res.statusCode !== 200) console.log('DEBUG CONVENIO PUT ERROR:', res.body);
            expect(res.statusCode).toBe(200);
            expect(res.body.nombre).toBe('Convenio Actualizado');
        });
    });

    describe('GET /api/convenios/codigo/:codigo', () => {
        it('debería encontrar un convenio por su código global', async () => {
            // Crear un convenio con código
            const convenioCodigo = await Convenio.create({ 
                nombre: 'Convenio Con Codigo', 
                empresa_id: empresaId,
                codigo: 'SUPERDESC123',
                status: 'ACTIVO',
                tipo_consulta: 'CODIGO_DESCUENTO'
            });

            const res = await request(app)
                .get(`/api/convenios/codigo/SUPERDESC123`)
                .set('x-api-key', 'TEST_API_KEY_123');

            expect(res.statusCode).toBe(200);
            expect(res.body.nombre).toBe('Convenio Con Codigo');
            expect(res.body.codigo).toBe('SUPERDESC123');
        });

        it('debería retornar 404 si el código no existe', async () => {
            const res = await request(app)
                .get(`/api/convenios/codigo/NO_EXISTE_ESTE_CODIGO`)
                .set('x-api-key', 'TEST_API_KEY_123');

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toContain('No se encontró un convenio activo');
        });
    });
});
