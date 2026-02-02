const { sequelize, Convenio, Empresa } = require('../src/models');

async function debug() {
    try {
        await sequelize.authenticate();
        console.log('DB Connection OK');

        console.log('Convenio Associations:', Object.keys(Convenio.associations));

        if (Convenio.associations.empresa) {
            console.log('Association "empresa" exists.');
            console.log('Target model:', Convenio.associations.empresa.target.name);
        } else {
            console.log('Association "empresa" MISSING.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debug();
