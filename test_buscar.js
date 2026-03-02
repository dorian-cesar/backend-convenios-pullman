require('dotenv').config();
const { sequelize } = require('./src/models');
const eventosService = require('./src/services/eventos.service');

async function check() {
    await sequelize.authenticate();
    try {
        const results = await eventosService.listarEventos({
            rut: "10520823-5"
        });
        console.log(JSON.stringify(results.rows[0], null, 2));
    } catch(err) {
        console.error("Crash object:", err);
    }
    process.exit(0);
}
check();
