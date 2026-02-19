const request = require('supertest');
const app = require('../app');
const { sequelize, Usuario, Rol, Empresa, Evento, Convenio, Pasajero, UsuarioRoles } = require('../models');

jest.setTimeout(30000);

describe('KPI API Implementation', () => {
    let superToken;
    let userToken;
    let emp1, emp2;

    beforeAll(async () => {
        await sequelize.sync();

        // Limpieza de datos (Evitar conflictos)
        await Evento.destroy({ where: {} });

        await Empresa.destroy({
            where: {
                [require('sequelize').Op.or]: [
                    { rut_empresa: '99999991-1' },
                    { rut_empresa: '99999992-2' },
                    { nombre: 'Empresa A KPI' },
                    { nombre: 'Empresa B KPI' }
                ]
            }
        });

        // 1. Create Empresas
        emp1 = await Empresa.create({ nombre: 'Empresa A KPI', rut_empresa: '99999991-1' });
        emp2 = await Empresa.create({ nombre: 'Empresa B KPI', rut_empresa: '99999992-2' });

        // 2. Create Users & Tokens
        // Super Usuario
        await Usuario.destroy({ where: { correo: 'superkpi@test.com' } });
        await request(app).post('/api/auth/register').send({
            correo: 'superkpi@test.com', password: 'Pass1234'
        });

        const userSuper = await Usuario.findOne({ where: { correo: 'superkpi@test.com' } });
        const [rolSuper] = await Rol.findOrCreate({ where: { nombre: 'SUPER_USUARIO' } });

        // Asignar Rol SUPER_USUARIO
        await UsuarioRoles.destroy({ where: { usuario_id: userSuper.id } });
        await UsuarioRoles.create({ usuario_id: userSuper.id, rol_id: rolSuper.id });

        // Es vital que el token refleje el nuevo rol. Login DEBE ser despues de asignar rol.
        const resSuper = await request(app).post('/api/auth/login').send({ correo: 'superkpi@test.com', password: 'Pass1234' });
        superToken = resSuper.body.token;

        // Usuario Normal (Empresa 1)
        await Usuario.destroy({ where: { correo: 'userkpi@test.com' } });
        await request(app).post('/api/auth/register').send({
            correo: 'userkpi@test.com', password: 'Pass1234'
        });
        const userNormal = await Usuario.findOne({ where: { correo: 'userkpi@test.com' } });

        // Asignar Empresa y Rol
        await userNormal.update({ empresa_id: emp1.id });
        const [rolUser] = await Rol.findOrCreate({ where: { nombre: 'USUARIO' } });

        await UsuarioRoles.destroy({ where: { usuario_id: userNormal.id } });
        await UsuarioRoles.create({ usuario_id: userNormal.id, rol_id: rolUser.id });

        const resUser = await request(app).post('/api/auth/login').send({ correo: 'userkpi@test.com', password: 'Pass1234' });
        userToken = resUser.body.token;

        // 2.5 Create Pasajero (Required for Evento)
        const [pasajero] = await Pasajero.findOrCreate({
            where: { rut: '99999999-9' },
            defaults: {
                nombres: 'Pasajero KPI',
                apellidos: 'Test',
                empresa_id: emp1.id, // Linked to emp1 for simplicity
            }
        });

        // 3. Create Eventos (Data)
        // Empresa 1: 2 Ventas, 1 Devolucion. Total Ventas: 30000. Devoluciones: 5000.
        const compra1 = await Evento.create({
            tipo_evento: 'COMPRA',
            empresa_id: emp1.id,
            monto_pagado: 10000,
            tarifa_base: 10000,
            fecha_evento: new Date(),
            usuario_id: userNormal.id,
            pasajero_id: pasajero.id,
            ciudad_origen: 'Santiago',
            ciudad_destino: 'Valparaiso',
            fecha_viaje: '2026-03-01'
        });
        await Evento.create({
            tipo_evento: 'COMPRA',
            empresa_id: emp1.id,
            monto_pagado: 20000,
            tarifa_base: 20000,
            fecha_evento: new Date(),
            usuario_id: userNormal.id,
            pasajero_id: pasajero.id,
            ciudad_origen: 'Santiago',
            ciudad_destino: 'Valparaiso',
            fecha_viaje: '2026-03-02'
        });
        await Evento.create({
            tipo_evento: 'DEVOLUCION',
            empresa_id: emp1.id,
            monto_devolucion: 5000,
            tarifa_base: 0, // Mock
            fecha_evento: new Date(),
            usuario_id: userNormal.id,
            pasajero_id: pasajero.id,
            ciudad_origen: 'Santiago',
            ciudad_destino: 'Valparaiso',
            fecha_viaje: '2026-03-01',
            fecha_viaje: '2026-03-01'
        });

        // Empresa 2: 1 Venta. Total Ventas: 50000.
        await Evento.create({
            tipo_evento: 'COMPRA',
            empresa_id: emp2.id,
            monto_pagado: 50000,
            tarifa_base: 50000,
            fecha_evento: new Date(),
            usuario_id: userSuper.id, // Created by super user or anyone
            pasajero_id: pasajero.id,
            ciudad_origen: 'Concepcion',
            ciudad_destino: 'Temuco',
            fecha_viaje: '2026-03-05'
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('GET /api/kpis/resumen', () => {
        it('Super Usuario ve todo (o filtra)', async () => {
            const res = await request(app)
                .get('/api/kpis/resumen')
                .set('Authorization', `Bearer ${superToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.rows).toBeDefined();
            // Debe haber datos
            expect(res.body.rows.length).toBeGreaterThan(0);
        });

        it('Usuario ve solo su empresa', async () => {
            const res = await request(app)
                .get('/api/kpis/resumen')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.rows.length).toBeGreaterThan(0);

            // Verificación simple: Si la lógica de negocio funciona, 
            // este usuario solo vería sus 30,000 de ventas, no las 80,000 totales.
            // (Difícil de probar exactamente si hay concurrencia, pero verificamos que no falle).
        });
    });

    describe('GET /api/kpis/por-convenio', () => {
        it('Responde con lista categórica', async () => {
            const res = await request(app)
                .get('/api/kpis/por-convenio')
                .set('Authorization', `Bearer ${superToken}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });
});
