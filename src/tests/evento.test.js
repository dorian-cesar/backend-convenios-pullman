const request = require('supertest');
const app = require('../app');
const { sequelize, Empresa, Convenio, Pasajero, Evento, Usuario } = require('../models');

jest.setTimeout(30000);

describe('Eventos API', () => {
    let token;
    let usuarioId;
    let empresaId;
    let convenioId;
    let pasajeroId;

    beforeAll(async () => {
        await sequelize.sync();

        const authRes = await request(app)
            .post('/api/auth/login')
            .send({
                correo: 'admin@pullman.cl',
                password: 'Admin1234'
            });
        token = authRes.body.token;

        const adminUser = await Usuario.findOne({ where: { correo: 'admin@pullman.cl' } });
        usuarioId = adminUser.id;

        // Limpiar datos previos
        await Empresa.destroy({ where: { nombre: 'Empresa Para Eventos' } });

        const [empresa] = await Empresa.findOrCreate({
            where: { rut_empresa: '44444444-4' },
            defaults: { nombre: 'Empresa Para Eventos', status: 'ACTIVO' }
        });
        empresaId = empresa.id;

        const [convenio] = await Convenio.findOrCreate({
            where: { empresa_id: empresa.id, nombre: 'Convenio Eventos Test' },
            defaults: { status: 'ACTIVO' }
        });
        convenioId = convenio.id;

        const [pasajero] = await Pasajero.findOrCreate({
            where: { rut: '22222222-2' },
            defaults: {
                nombres: 'Pasajero Evento',
                apellidos: 'Test',
                empresa_id: empresaId,
                convenio_id: convenioId
            }
        });
        pasajeroId = pasajero.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/eventos/compra', () => {
        it('debería registrar una compra (evento)', async () => {
            const res = await request(app)
                .post('/api/eventos/compra')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    usuario_id: usuarioId,
                    pasajero_id: pasajeroId,
                    empresa_id: empresaId,
                    convenio_id: convenioId,
                    ciudad_origen: 'Santiago',
                    ciudad_destino: 'Valparaíso',
                    fecha_viaje: '2026-02-15',
                    tarifa_base: 10000,
                    numero_asiento: 'A1'
                });

            if (res.statusCode !== 201) console.log('DEBUG EVENTO:', res.body);
            expect(res.statusCode).toBe(201);
            expect(res.body.tarifa_base).toBe(10000);
            expect(res.body.tipo_evento).toBe('COMPRA');
        });
    });

    describe('GET /api/eventos', () => {
        it('debería listar los eventos', async () => {
            const res = await request(app)
                .get('/api/eventos')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.rows)).toBe(true);
        });
    });
});
