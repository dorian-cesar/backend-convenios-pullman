const mysql = require('mysql2/promise');
require('dotenv').config();

async function cloneData() {
    console.log('Iniciando clonación de datos...');
    try {
        // Conexión a la base de datos de Producción
        const connProd = await mysql.createConnection({
            host: process.env.HOST_BD,
            user: process.env.USUARIO_BD,
            password: process.env.CLAVE_BD,
            port: process.env.PORT_BD,
            database: 'convenios' // Prod
        });

        // Conexión a la base de datos de Desarrollo
        const connDev = await mysql.createConnection({
            host: process.env.HOST_BD,
            user: process.env.USUARIO_BD,
            password: process.env.CLAVE_BD,
            port: process.env.PORT_BD,
            database: 'convenios-dev' // Dev
        });

        console.log('Conexiones exitosas. Copiando Empresas...');
        const [empresas] = await connProd.query('SELECT * FROM empresas');
        for (const emp of empresas) {
            await connDev.query('INSERT IGNORE INTO empresas SET ?', emp);
        }

        console.log('Copiando ApiConsultas...');
        const [apis] = await connProd.query('SELECT * FROM apis_consulta');
        for (const api of apis) {
            await connDev.query('INSERT IGNORE INTO apis_consulta SET ?', api);
        }

        console.log('Copiando Categorias...');
        const [categorias] = await connProd.query('SELECT * FROM categorias');
        for (const cat of categorias) {
            await connDev.query('INSERT IGNORE INTO categorias SET ?', cat);
        }

        console.log('Copiando Convenios...');
        const [convenios] = await connProd.query('SELECT * FROM convenios');
        for (const conv of convenios) {
            if (typeof conv.rutas === 'object' && conv.rutas !== null) {
                conv.rutas = JSON.stringify(conv.rutas);
            }
            if (typeof conv.configuraciones === 'object' && conv.configuraciones !== null) {
                conv.configuraciones = JSON.stringify(conv.configuraciones);
            }
            if (typeof conv.imagenes === 'object' && conv.imagenes !== null) {
                conv.imagenes = JSON.stringify(conv.imagenes);
            }
            await connDev.query('INSERT IGNORE INTO convenios SET ?', conv);
        }

        console.log('¡Clonación exitosa! Se copiaron ' + convenios.length + ' convenios.');

        await connProd.end();
        await connDev.end();
    } catch(e) {
        console.error('Error clonando datos:', e);
    }
}

cloneData();
