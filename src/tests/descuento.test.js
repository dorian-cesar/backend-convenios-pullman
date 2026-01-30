const request = require('supertest');
const app = require('../app');
const { sequelize, Empresa, Convenio, Descuento, TipoPasajero } = require('../models');

jest.setTimeout(30000);

describe('Descuentos API', () => {
    let token;
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
        await Empresa.destroy({ where: { nombre: 'Empresa Para Descuento' } });

        // Necesitamos una empresa y un convenio
        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '77777777-7' },
            defaults: { nombre: 'Empresa Para Descuento', status: 'ACTIVO' }
        });

        const [convenio] = await Convenio.findOrCreate({
            where: { empresa_id: empresa.id, nombre: 'Convenio Descuento Test' },
            defaults: { status: 'ACTIVO' }
        });
        convenioId = convenio.id;

        // Necesitamos un tipo de pasajero
        const [tipo] = await TipoPasajero.findOrCreate({
            where: { nombre: 'ESTUDIANTE' },
            defaults: { status: 'ACTIVO' }
        });
        tipoPasajeroId = tipo.id;

        // Limpiar descuentos previos para esta combinación
        await Descuento.destroy({
            where: {
                convenio_id: convenioId,
                tipo_pasajero_id: tipoPasajeroId
            }
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/descuentos', () => {
        it('debería crear un descuento para un convenio y tipo de pasajero', async () => {
            const res = await request(app)
                .post('/api/descuentos')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    convenio_id: convenioId,
                    tipo_pasajero_id: tipoPasajeroId,
                    porcentaje_descuento: 25
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.porcentaje_descuento).toBe(25);
            expect(res.body.convenio_id).toBe(convenioId);
            expect(res.body.tipo_pasajero_id).toBe(tipoPasajeroId);
        });

        it('debería fallar si falta el porcentaje', async () => {
            const res = await request(app)
                .post('/api/descuentos')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    convenio_id: convenioId,
                    tipo_pasajero_id: tipoPasajeroId
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/descuentos', () => {
        it('debería listar descuentos con filtros', async () => {
            const res = await request(app)
                .get(`/api/descuentos?convenio_id=${convenioId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.rows)).toBe(true);
            expect(res.body.rows.length).toBeGreaterThan(0);
        });
    });
});
