const request = require('supertest');
const app = require('./src/app');
const { sequelize, Fach } = require('./src/models');

async function test() {
    await sequelize.authenticate();
    
    // 1. Limpiamos data anterior (fuerzalo de la DB)
    await Fach.destroy({ where: { rut: '18000000-K' }, force: true }).catch(()=>null);

    // 2. Simulamos Login Admin para obtener Token
    // Si no puedes loguear, probare sin Token, o usaré Token de db anterior. 
    // Usaremos un bypass temporal del token solo por el supertest o creamos el jwt
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 1, email: 'test@admin.cl' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    console.log("=== CREAR FACH ===");
    const resCrear = await request(app)
        .post('/api/fach')
        .set('Authorization', `Bearer ${token}`)
        .send({
            rut: "18.000.000-k", // se enviara con puntos, deberia formatearse a 18000000-K
            nombre_completo: "Soldado Prueba",
            status: "ACTIVO"
        });
    console.log(resCrear.status, resCrear.body);

    console.log("=== LISTAR FACH ===");
    const resListar = await request(app)
        .get('/api/fach')
        .set('Authorization', `Bearer ${token}`);
    console.log(resListar.status, `TotalItems: ${resListar.body.totalItems}, Primero:`, resListar.body.data[0]);

    console.log("=== OBTENER POR RUT ===");
    const resObtener = await request(app)
        .get('/api/fach/18000000-K')
        .set('Authorization', `Bearer ${token}`);
    console.log(resObtener.status, resObtener.body);

    console.log("=== ALTERAR ESTADO ===");
    const resEstado = await request(app)
        .patch('/api/fach/18000000-K/estado')
        .set('Authorization', `Bearer ${token}`);
    console.log(resEstado.status, resEstado.body.status);

    console.log("=== BORRAR (SOFT) ===");
    const resBorrar = await request(app)
        .delete('/api/fach/18000000-K')
        .set('Authorization', `Bearer ${token}`);
    console.log(resBorrar.status, resBorrar.body);

    process.exit(0);
}
test();
