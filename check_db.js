const { sequelize } = require('./src/models');
async function check() {
    await sequelize.authenticate();
    const [results] = await sequelize.query("DESCRIBE eventos;");
    console.log(results.map(r => r.Field));
    process.exit(0);
}
check();
