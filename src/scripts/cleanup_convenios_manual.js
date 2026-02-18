
process.env.TZ = 'America/Santiago';
require('dotenv').config();
const { sequelize } = require('../models');
const convenioService = require('../services/convenio.service');

async function runCleanup() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Syncing database schema (alter: true)...');
        await sequelize.sync({ alter: true });
        console.log('Schema synced.');

        console.log('Running cleanup of expired conventions...');
        const result = await convenioService.desactivarConveniosVencidos();

        console.log('Cleanup finished.');
        console.log(`Total conventions deactivated: ${result.total}`);

        process.exit(0);
    } catch (error) {
        console.error('Error running cleanup:', error);
        process.exit(1);
    }
}

runCleanup();
