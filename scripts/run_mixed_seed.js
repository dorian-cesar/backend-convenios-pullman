const { sequelize } = require('../src/models');
const seed = require('../src/seeds/mixed_status_discounts.seed');

async function run() {
    try {
        await sequelize.authenticate();
        await seed();
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

run();
