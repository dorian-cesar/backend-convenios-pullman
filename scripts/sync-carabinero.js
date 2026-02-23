const { sequelize, Carabinero } = require('../src/models');

async function syncCarabinero() {
    try {
        console.log('Synchronizing Carabinero model with database...');
        await Carabinero.sync({ alter: true });
        console.log('Carabinero model synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error synchronizing Carabinero model:', error);
        process.exit(1);
    }
}

syncCarabinero();
