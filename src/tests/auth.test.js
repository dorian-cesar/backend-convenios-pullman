const request = require('supertest');
const app = require('../app');
const { Usuario, Rol, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

jest.setTimeout(30000);

describe('Auth API', () => {
    beforeAll(async () => {
        // Limpiar usuarios de prueba
        await Usuario.destroy({ where: { correo: 'test@pullman.cl' } });

        // Asegurar que existe el rol SUPER_USUARIO para el registro
        await Rol.findOrCreate({ where: { nombre: 'SUPER_USUARIO' }, defaults: { status: 'ACTIVO' } });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/auth/register', () => {
        it('debería registrar un nuevo usuario exitosamente', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    correo: 'test@pullman.cl',
                    password: 'Password1234'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
        });

        it('debería fallar si el correo ya existe', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    correo: 'test@pullman.cl',
                    password: 'Password1234'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('El correo ya está registrado');
        });
    });

    describe('POST /api/auth/login', () => {
        it('debería iniciar sesión exitosamente', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    correo: 'test@pullman.cl',
                    password: 'Password1234'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('debería fallar con credenciales incorrectas', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    correo: 'test@pullman.cl',
                    password: 'WrongPassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Credenciales inválidas');
        });
    });
});
