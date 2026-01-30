const request = require('supertest');
const app = require('../app');
const { sequelize, Empresa } = require('../models');

jest.setTimeout(30000);

describe('Empresas API', () => {
    let token;

    beforeAll(async () => {
        // Asegurar esquema
        await sequelize.sync();
        // Limpiar datos de prueba
        await Empresa.destroy({
            where: {
                [require('sequelize').Op.or]: [
                    { rut_empresa: '11111111-1' },
                    { nombre: 'Nueva Empresa S.A.' },
                    { nombre: 'Empresa Test' }
                ]
            }
        });

        // Login as admin to get token
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                correo: 'admin@pullman.cl',
                password: 'Admin1234'
            });
        token = res.body.token;

        // Crear empresa base
        await Empresa.findOrCreate({
            where: { rut_empresa: '99999999-9' },
            defaults: { nombre: 'Empresa Test', status: 'ACTIVO' }
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('GET /api/empresas', () => {
        it('debería listar empresas', async () => {
            const res = await request(app)
                .get('/api/empresas')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.rows)).toBe(true);
        });
    });

    describe('POST /api/empresas', () => {
        it('debería crear una empresa', async () => {
            const res = await request(app)
                .post('/api/empresas')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nombre: 'Nueva Empresa S.A.',
                    rut: '11111111-1'
                });

            if (res.statusCode !== 201) console.log('DEBUG EMPRESA CREATE ERROR:', res.body);
            expect(res.statusCode).toBe(201);
            expect(res.body.nombre).toBe('Nueva Empresa S.A.');
        });
    });
});
