require('dotenv').config();
const { sequelize } = require('./src/models');

async function checkModels() {
    try {
        console.log('--- Verificando Modelos ---');
        const models = sequelize.models;
        Object.keys(models).forEach(modelName => {
            console.log(`✅ Modelo Cargado: ${modelName}`);
            const associations = models[modelName].associations;
            Object.keys(associations).forEach(assocName => {
                console.log(`   🔗 Asociación: ${assocName} -> ${associations[assocName].target.name} (${associations[assocName].associationType})`);
            });
        });
        console.log('--- Verificación Exitosa ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error verifica modelos:', error);
        process.exit(1);
    }
}

checkModels();
