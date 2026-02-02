const { sequelize } = require('../src/models');
const seed = require('../src/seeds/discounts_demo.seed');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('DB Connection OK');
        await seed();
    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await sequelize.close();
    }
}

run();
