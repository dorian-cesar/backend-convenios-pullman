require('dotenv').config();
const { Empresa, Convenio } = require('../src/models');

async function findIds() {
    try {
        const empresa = await Empresa.findOne({
            where: { nombre: 'CARABINEROS DE CHILE' }
        });

        const convenio = await Convenio.findOne({
            where: { nombre: 'CARABINEROS' }
        });

        console.log('--- RESULTS ---');
        console.log('Empresa ID:', empresa ? empresa.id : 'NOT FOUND');
        console.log('Convenio ID:', convenio ? convenio.id : 'NOT FOUND');
        console.log('---------------');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

findIds();
