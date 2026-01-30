const request = require('supertest');
const app = require('../app');
const { sequelize, Empresa, Convenio, Pasajero, TipoPasajero } = require('../models');

jest.setTimeout(30000);

describe('Pasajeros API', () => {
    let token;
    let empresaId;
    let convenioId;
    let tipoPasajeroId;

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
        await Empresa.destroy({ where: { nombre: 'Empresa Para Pasajeros' } });

        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '55555555-5' },
            defaults: { nombre: 'Empresa Para Pasajeros', status: 'ACTIVO' }
        });
        empresaId = empresa.id;

        const [convenio] = await Convenio.findOrCreate({
            where: { empresa_id: empresa.id, nombre: 'Convenio Pasajeros Test' },
            defaults: { status: 'ACTIVO' }
        });
        convenioId = convenio.id;

        const [tipo] = await TipoPasajero.findOrCreate({
            where: { nombre: 'ESTUDIANTE' },
            defaults: { status: 'ACTIVO' }
        });
        tipoPasajeroId = tipo.id;

        // Limpiar pasajero de prueba
        await Pasajero.destroy({ where: { rut: '12345678-0' } });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/pasajeros', () => {
        it('debería crear un pasajero exitosamente', async () => {
            const res = await request(app)
                .post('/api/pasajeros')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rut: '12345678-0',
                    nombres: 'Pasajero',
                    apellidos: 'Test',
                    fecha_nacimiento: '1990-01-01',
                    empresa_id: empresaId,
                    convenio_id: convenioId,
                    tipo_pasajero_id: tipoPasajeroId
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.rut).toBe('12345678-0');
        });
    });

    describe('GET /api/pasajeros', () => {
        it('debería listar los pasajeros', async () => {
            const res = await request(app)
                .get('/api/pasajeros')
                .set('Authorization', `Bearer ${token}`);

            if (res.statusCode !== 200) console.log('DEBUG PASAJEROS GET ERROR:', res.body);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.rows)).toBe(true);
        });
    });
});
