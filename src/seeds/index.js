const { sequelize } = require('../models');
const seedRoles = require('./rol.seed');
const seedEmpresas = require('./empresa.seed');
const seedTipoPasajero = require('./tipoPasajero.seed');
const seedUsuarios = require('./usuario.seed');
const seedConvenios = require('./convenio.seed');
const seedCarabineros = require('./carabineros.seed');

async function runSeeds() {
  try {
    console.log('🌱 Iniciando seeding...');

    await sequelize.authenticate();
    console.log('🗄️ Conexión establecida para seeding');

    await seedRoles();
    await seedEmpresas();
    await seedTipoPasajero();
    await seedUsuarios();
    await seedConvenios();
    await seedCarabineros();

    console.log('✨ Seeding completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  }
}

runSeeds();
