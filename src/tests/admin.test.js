const request = require('supertest');
const app = require('../app');
const { sequelize, Usuario, Rol } = require('../models');

jest.setTimeout(30000);

describe('Admin API', () => {
    let token;

    beforeAll(async () => {
        // Asegurar esquema sincronizado
        await sequelize.sync();
        // Limpiar usuario de prueba
        await Usuario.destroy({ where: { correo: 'newuser@pullman.cl' } });

        // Login as admin to get token
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                correo: 'admin@pullman.cl',
                password: 'Admin1234'
            });
        token = res.body.token;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('GET /api/admin/usuarios', () => {
        it('debería listar todos los usuarios', async () => {
            const res = await request(app)
                .get('/api/admin/usuarios')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('debería fallar sin token', async () => {
            const res = await request(app).get('/api/admin/usuarios');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/admin/usuarios', () => {
        it('debería crear un nuevo usuario', async () => {
            const res = await request(app)
                .post('/api/admin/usuarios')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    correo: 'newuser@pullman.cl',
                    password: 'Password1234',
                    rol: 'USUARIO'
                });

            if (res.statusCode !== 201) console.log('DEBUG ADMIN CREATE ERROR:', res.body);
            expect(res.statusCode).toBe(201);
            expect(res.body.correo).toBe('newuser@pullman.cl');
        });
    });
});
