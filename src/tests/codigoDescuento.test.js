const request = require('supertest');
const app = require('../app');
const { sequelize, Empresa, Convenio, CodigoDescuento } = require('../models');

jest.setTimeout(30000);

describe('Códigos de Descuento API', () => {
    let token;
    let convenioId;

    beforeAll(async () => {
        await sequelize.sync();

        const authRes = await request(app)
            .post('/api/auth/login')
            .send({
                correo: 'admin@pullman.cl',
                password: 'Admin1234'
            });
        token = authRes.body.token;

        // Limpiar datos previos
        await Empresa.destroy({ where: { nombre: 'Empresa Para Codigos' } });

        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '66666666-6' },
            defaults: { nombre: 'Empresa Para Codigos', status: 'ACTIVO' }
        });

        const [convenio] = await Convenio.findOrCreate({
            where: { empresa_id: empresa.id, nombre: 'Convenio Codigos Test' },
            defaults: { status: 'ACTIVO' }
        });
        convenioId = convenio.id;

        // Limpiar códigos de prueba
        await CodigoDescuento.destroy({ where: { codigo: 'TEST2026' } });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/codigos-descuento', () => {
        it('debería crear un código de descuento', async () => {
            const res = await request(app)
                .post('/api/codigos-descuento')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    convenio_id: convenioId,
                    codigo: 'TEST2026',
                    fecha_inicio: '2026-01-01',
                    fecha_termino: '2026-12-31',
                    max_usos: 100
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.codigo).toBe('TEST2026');
        });

        it('debería fallar si el código ya existe', async () => {
            const res = await request(app)
                .post('/api/codigos-descuento')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    convenio_id: convenioId,
                    codigo: 'TEST2026',
                    fecha_inicio: '2026-01-01',
                    fecha_termino: '2026-12-31'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/codigos-descuento', () => {
        it('debería listar los códigos', async () => {
            const res = await request(app)
                .get('/api/codigos-descuento')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.rows)).toBe(true);
        });
    });
});
