const { sequelize } = require('../models');
const seedRoles = require('./rol.seed');
const seedTipoPasajero = require('./tipoPasajero.seed');
const seedUsuarios = require('./usuario.seed');
const seedCleanDemo = require('./seed_clean_demo');

async function runSeeds() {
  try {
    console.log('🌱 Iniciando seeding...');

    await sequelize.authenticate();
    console.log('🗄️ Conexión establecida para seeding');

    await seedRoles();
    await seedTipoPasajero();
    await seedUsuarios();
    await seedCleanDemo();

    console.log('✨ Seeding completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  }
}

runSeeds();
