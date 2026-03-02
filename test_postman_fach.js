const request = require('supertest');
const app = require('./src/app');
const { sequelize, Fach } = require('./src/models');
const jwt = require('jsonwebtoken');

async function test() {
    await sequelize.authenticate();
    const token = jwt.sign({ id: 1, email: 'test@admin.cl', roles: [{ nombre: 'ADMIN' }] }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    console.log("=== API TESTS ===");
    try {
        const resetReq = await Fach.destroy({ where: { rut: '20000000-0' }, force: true }).catch(() => null);

        const res1 = await request(app).post('/api/fach').set('Authorization', `Bearer ${token}`).send({ rut: '20.000.000-0', nombre_completo: 'Julio FACH' });
        console.log("POST:", res1.status, res1.body);

        const res2 = await request(app).get('/api/fach/20000000-0').set('Authorization', `Bearer ${token}`);
        console.log("GET BY RUT:", res2.status, res2.body.rut, res2.body.status);

        const res3 = await request(app).get('/api/fach?rut=20000000-0').set('Authorization', `Bearer ${token}`);
        console.log("LIST:", res3.status, res3.body.totalItems);
        
        await Fach.destroy({ where: { rut: '20000000-0' }, force: true }).catch(() => null);
    } catch(err) {
        console.error("Test execution failed:", err);
    }
    
    process.exit(0);
}
test();
